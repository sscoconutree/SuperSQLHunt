import json
import pathlib
import sys
try:
    import yaml
except ImportError:
    print("Error: PyYAML is not installed. Please run 'pip install PyYAML'", file=sys.stderr)
    sys.exit(1)

RULES_DIR = pathlib.Path("_rules")
OUTPUT_FILE = pathlib.Path("docs/rules.json")
all_rules = []

print(f"Starting rule build from '{RULES_DIR}'...")

yaml_files = list(RULES_DIR.glob("*.yaml"))
yml_files = list(RULES_DIR.glob("*.yml"))
rule_files = yaml_files + yml_files

if not rule_files:
    print("No .yaml or .yml files found. Exiting.", file=sys.stderr)
    sys.exit(0)

for file_path in rule_files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            rule_data = yaml.safe_load(content)
            if rule_data:
                all_rules.append(rule_data)
    except yaml.YAMLError as e:
        print(f"Error parsing YAML file {file_path}: {e}", file=sys.stderr)
    except Exception as e:
        print(f"Error processing file {file_path}: {e}", file=sys.stderr)

try:
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_rules, f, indent=2)
except IOError as e:
    print(f"Error writing to output file {OUTPUT_FILE}: {e}", file=sys.stderr)
    sys.exit(1)

print(f"Successfully aggregated {len(all_rules)} rules into '{OUTPUT_FILE}'.")