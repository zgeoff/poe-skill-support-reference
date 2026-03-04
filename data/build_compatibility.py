#!/usr/bin/env python3
"""
Build skill-to-support compatibility data from RePoE gems.min.json.

Game version: 3.27.0e (Phrecia league)
Reads: data/repoe_output/gems.min.json
Writes: data/poe_skill_support_compatibility.json

Computes support gem compatibility using allowed_types / excluded_types
matching from RePoE-extracted game data.

RePoE modification: We added extraction of the IgnoreMinionTypes boolean from
GrantedEffects.dat (via gems.py _convert_support_gem_specific and the Pydantic
models in model/gems.py and model/gems_minimal.py). This flag prevents supports
from matching minion skills via their minion types when the support can't actually
modify minion skills.

Known limitation: Trigger supports (e.g. Cast On Critical Strike, Cast on Melee Kill)
have ignore_minion_types=true but are exempted from that check here, since they link
two skills via a trigger condition rather than directly modifying the skill.
"""

import json
import os
import re

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_PATH = os.path.join(DATA_DIR, "repoe_output", "gems.min.json")
OUTPUT_PATH = os.path.join(DATA_DIR, "poe_skill_support_compatibility.json")

COLOR_MAP = {"r": "red", "g": "green", "b": "blue"}

# Gems that look normal in game data but are unobtainable (item-granted or legacy).
# No data field distinguishes these from real gems.
EXCLUDED_GEM_IDS = {
    "BloodOffering",       # Item-granted (Aukuna's Will)
    "Envy",                # Item-granted (United in Dream)
    "OilArrow",            # Legacy gem (Flammable Shot), removed from drop tables
    "SupportDivineBlessing",  # Removed from game
    "SupportEarthbreaker",    # Item-granted, not a droppable gem
}

# Gems incorrectly marked as unreleased in game data but exist in-game.
FORCE_RELEASED_GEM_IDS = {
    "BladeTrap",       # Blade Trap
    "BladeTrapAltX",   # Blade Trap of Greatswords
    "BladeTrapAltY",   # Blade Trap of Laceration
}


def is_excluded_gem(gem_id, display_name, tags):
    """Filter out gems that shouldn't appear in the compatibility data."""
    if gem_id in EXCLUDED_GEM_IDS:
        return True
    if "Royale" in gem_id:
        return True
    if "vaal" in tags:
        return True
    if display_name.startswith("[DNT]") or display_name.startswith("[UNUSED]"):
        return True
    if "Playtest" in display_name:
        return True
    if "exceptional" in tags:
        return True
    return False


def evaluate_rpn(expression, skill_types):
    """
    Evaluate a Reverse Polish Notation boolean expression against a set of
    skill types.

    Operands are type strings (evaluated to True if present in skill_types).
    Operators: AND, OR, NOT (unary).

    Items remaining on the stack after evaluation are OR'd together.
    This handles the common case where allowed_types is a plain list of types
    (no operators), meaning "skill has ANY of these types".
    """
    if not expression:
        return False

    skill_type_set = set(skill_types)
    stack = []

    for token in expression:
        if token == "AND":
            if len(stack) < 2:
                return False
            b = stack.pop()
            a = stack.pop()
            stack.append(a and b)
        elif token == "OR":
            if len(stack) < 2:
                return False
            b = stack.pop()
            a = stack.pop()
            stack.append(a or b)
        elif token == "NOT":
            if len(stack) < 1:
                return False
            a = stack.pop()
            stack.append(not a)
        else:
            # It's a type name; check membership
            stack.append(token in skill_type_set)

    # Remaining items on stack are OR'd together
    return any(stack)


def is_compatible(support_gem_data, active_skill_types, minion_types=None,
                   is_trigger=False, disable_skill_if=None):
    """
    Determine if a support gem is compatible with an active skill based on
    its allowed_types and excluded_types.

    - If allowed_types is empty/None: supports everything (subject to exclusions).
    - If allowed_types is non-empty: evaluate the RPN expression; must be True.
    - If excluded_types is non-empty: evaluate the RPN expression; must be False.

    For minion skills, allowed_types is checked against both the skill's own
    types and its minion_types (combined), since supports like Multistrike
    can apply to the minions' attacks. Excluded_types is checked against the
    combined set as well.

    Trigger supports (is_trigger=True) are exempt from ignore_minion_types
    since they link skills via a trigger condition rather than directly
    modifying the skill.

    disable_skill_if is a dict of stat-based restrictions from static.stats,
    e.g. {"melee_attack": True} from "disable_skill_if_melee_attack". These
    are checked against the skill's types before type-expression matching.
    """
    sg = support_gem_data

    # Check stat-based disable conditions before type matching.
    # Some supports encode restrictions as stats rather than excluded_types.
    # Currently only "disable_skill_if_melee_attack" causes false positives;
    # "disable_skill_if_weapon_not_bow" is redundant because Mirage Archer
    # already uses MirageArcherCanUse in allowed_types.
    if disable_skill_if:
        if disable_skill_if.get("melee_attack") and "Melee" in active_skill_types:
            return False

    allowed = sg.get("allowed_types") or []
    excluded = sg.get("excluded_types") or []

    # If the support has ignore_minion_types (and isn't a trigger), only check
    # the skill's own types. Otherwise, combine with minion types for matching.
    ignore_minion = sg.get("ignore_minion_types", False) and not is_trigger
    if ignore_minion or not minion_types:
        combined_types = list(active_skill_types)
    else:
        combined_types = list(set(active_skill_types) | set(minion_types))

    # Check allowed types against combined types
    if allowed:
        if not evaluate_rpn(allowed, combined_types):
            return False

    # Check excluded types against combined types
    if excluded:
        if evaluate_rpn(excluded, combined_types):
            return False

    return True


def main():
    with open(INPUT_PATH) as f:
        gems = json.load(f)

    # Collect active skill gems and support gems
    active_gems = []
    support_gems = []

    for gem_id, gem in gems.items():
        base_item = gem.get("base_item")
        if not base_item:
            continue
        if base_item.get("release_state") != "released" and gem_id not in FORCE_RELEASED_GEM_IDS:
            continue

        color_code = gem.get("color")
        if color_code not in COLOR_MAP:
            continue

        # Only include actual gem items (not item-granted skills like Graft gems)
        base_item_id = base_item.get("id", "")
        if "Metadata/Items/Gems" not in base_item_id:
            continue

        display_name = base_item.get("display_name", "")
        if not display_name:
            continue

        tags = gem.get("tags", [])
        if is_excluded_gem(gem_id, display_name, tags):
            continue

        if gem.get("is_support"):
            if "Awakened" in display_name:
                continue
            support_gem_data = gem.get("support_gem")
            if not support_gem_data:
                continue
            # Trigger supports link two skills via a condition (e.g. "cast X when Y crits")
            # rather than directly modifying a skill, so they're exempt from
            # ignore_minion_types filtering.
            is_trigger = bool(re.match(r"^(Awakened )?Cast (on |On |when |while )", display_name))
            # Extract disable_skill_if_* stats from static.stats
            disable_skill_if = {}
            static_stats = gem.get("static", {}).get("stats") or []
            for stat in static_stats:
                if not stat:
                    continue
                stat_id = stat.get("id") or ""
                if stat_id.startswith("disable_skill_if_"):
                    key = stat_id.replace("disable_skill_if_", "")
                    disable_skill_if[key] = True
            support_gems.append({
                "id": gem_id,
                "name": display_name,
                "color": COLOR_MAP[color_code],
                "data": support_gem_data,
                "is_trigger": is_trigger,
                "disable_skill_if": disable_skill_if,
            })
        else:
            active_skill = gem.get("active_skill")
            if not active_skill:
                continue
            types = active_skill.get("types")
            if not types:
                continue
            # Use active_skill.display_name for the skill name, as it
            # includes transfigured variant names (e.g. "Arc of Surging")
            # while base_item.display_name only has the base name ("Arc").
            skill_name = active_skill.get("display_name") or display_name
            active_gems.append({
                "id": gem_id,
                "name": skill_name,
                "color": COLOR_MAP[color_code],
                "types": types,
                "minion_types": active_skill.get("minion_types", []),
            })

    # Deduplicate gems by (color, display_name), preferring the "base" gem ID
    # (shortest / no Alt/Royale/Vaal suffix) for canonical type lists.
    def gem_id_priority(gem_id):
        """Lower = more preferred. Base gems sort first."""
        if re.search(r"(Alt[A-Z]|Royale|Vaal)", gem_id):
            return (1, len(gem_id), gem_id)
        return (0, len(gem_id), gem_id)

    seen_supports = {}
    for support in support_gems:
        key = (support["color"], support["name"])
        if key not in seen_supports or gem_id_priority(support["id"]) < gem_id_priority(seen_supports[key]["id"]):
            seen_supports[key] = support
    support_gems = list(seen_supports.values())

    print(f"Found {len(active_gems)} active gem entries, {len(support_gems)} support gems")

    seen = {}
    for active in active_gems:
        key = (active["color"], active["name"])
        if key not in seen or gem_id_priority(active["id"]) < gem_id_priority(seen[key]["id"]):
            seen[key] = active

    active_gems = list(seen.values())
    print(f"After dedup: {len(active_gems)} unique active gems")

    # Build compatibility map
    result = {"red": {}, "green": {}, "blue": {}}

    for active in active_gems:
        color = active["color"]
        name = active["name"]
        compatible_supports = []

        for support in support_gems:
            if is_compatible(support["data"], active["types"],
                             active.get("minion_types"),
                             is_trigger=support.get("is_trigger", False),
                             disable_skill_if=support.get("disable_skill_if")):
                compatible_supports.append({
                    "name": support["name"],
                    "color": support["color"],
                })

        # Sort supports alphabetically by name
        compatible_supports.sort(key=lambda s: s["name"])
        result[color][name] = compatible_supports

    # Sort skills alphabetically within each color
    for color in result:
        result[color] = dict(sorted(result[color].items()))

    # Write output
    with open(OUTPUT_PATH, "w") as f:
        json.dump(result, f, indent=2)
        f.write("\n")

    # Print stats
    for color in ["red", "green", "blue"]:
        print(f"  {color}: {len(result[color])} skills")

    total = sum(len(v) for v in result.values())
    print(f"  Total: {total} skills")

    # Sanity check: Lifetap
    lifetap_count = 0
    for color, skills in result.items():
        for skill_name, supports in skills.items():
            for s in supports:
                if "Lifetap" in s["name"]:
                    lifetap_count += 1
    print(f"\n  Lifetap Support appears on {lifetap_count} skills")

    return result


if __name__ == "__main__":
    main()
