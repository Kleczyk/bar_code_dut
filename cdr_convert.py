import subprocess
import sys
from pathlib import Path


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: python cdr_convert.py INPUT.cdr OUTPUT.svg|png|pdf")
        return 2

    inp = Path(sys.argv[1])
    out = Path(sys.argv[2])

    if not inp.exists():
        print(f"Input file not found: {inp}")
        return 2

    export_type = out.suffix.lstrip(".")
    if not export_type:
        print("Output file needs an extension, e.g. output.svg")
        return 2

    subprocess.run(
        [
            "inkscape",
            str(inp),
            f"--export-type={export_type}",
            f"--export-filename={out}",
        ],
        check=True,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
