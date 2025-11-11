#!/usr/bin/env python3
# orchestrator.py
import yaml, sys, subprocess, math, glob, os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

def load_job(path):
    with open(path) as f:
        return yaml.safe_load(f)

def collect_pytest_files(tests_root="tests"):
    # adjust glob to your repo structure
    return sorted(glob.glob(f"{tests_root}/**/test_*.py", recursive=True))

def shard_files(files, shards):
    out = [[] for _ in range(shards)]
    # simple round-robin / balanced by count
    for i, f in enumerate(files):
        out[i % shards].append(f)
    return out

def run_pytest_shard(shard_index, files, env_vars):
    if not files:
        return 0, shard_index, 0
    cmd = ["pytest", "-q", "--maxfail=1"] + files
    print(f"[shard {shard_index}] running: {' '.join(cmd)}")
    proc = subprocess.run(cmd, env={**os.environ, **env_vars})
    return proc.returncode, shard_index, len(files)

def run_playwright_shard(shard_index, total_shards, env_vars):
    # Playwright supports native sharding: --shard=INDEX/TOTAL
    shard_arg = f"{shard_index}/{total_shards}"
    cmd = ["npx", "playwright", "test", f"--shard={shard_arg}"]
    print(f"[shard {shard_index}] running: {' '.join(cmd)}")
    proc = subprocess.run(cmd, env={**os.environ, **env_vars})
    return proc.returncode, shard_index, "playwright-shard"

def main(job_yaml):
    job = load_job(job_yaml)
    spec = job.get("spec", {})
    framework = spec.get("framework", "pytest")
    parallelism = int(spec.get("parallelism", 1))
    env_vars = spec.get("environment", {}).get("variables", {})
    shard_cfg = spec.get("sharding", {})
    print(f"Loaded job: {job.get('metadata', {}).get('name')}, framework={framework}, parallelism={parallelism}")

    if framework == "pytest":
        files = collect_pytest_files()
        shards = shard_files(files, parallelism)
        results = []
        with ThreadPoolExecutor(max_workers=parallelism) as ex:
            futures = []
            for i, shard_files_list in enumerate(shards, start=1):
                futures.append(ex.submit(run_pytest_shard, i, shard_files_list, env_vars))
            for f in as_completed(futures):
                results.append(f.result())
    elif framework == "playwright":
        results = []
        with ThreadPoolExecutor(max_workers=parallelism) as ex:
            futures = []
            for i in range(1, parallelism+1):
                futures.append(ex.submit(run_playwright_shard, i, parallelism, env_vars))
            for f in as_completed(futures):
                results.append(f.result())
    else:
        print("Unsupported framework:", framework)
        sys.exit(2)

    # summarize
    failed = [r for r in results if r[0] != 0]
    print("=== ORCHESTRATOR SUMMARY ===")
    for code, idx, cnt in results:
        print(f"shard {idx}: exit {code}, tests {cnt}")
    if failed:
        print(f"FAILED shards: {[f[1] for f in failed]}")
        sys.exit(1)
    else:
        print("ALL SHARDS PASSED")
        sys.exit(0)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: ./orchestrator.py regression-job.yml")
        sys.exit(2)
    main(sys.argv[1])