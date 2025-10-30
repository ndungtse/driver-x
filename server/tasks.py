#!/usr/bin/env python
"""Task runner for common development commands"""
import sys
import os
import subprocess


def run_command(cmd):
    """Run a shell command"""
    return subprocess.run(cmd, shell=True)


def dev():
    """Start development server"""
    return run_command("python manage.py runserver")


def migrate():
    """Run database migrations"""
    return run_command("python manage.py migrate")


def makemigrations():
    """Create new migrations"""
    return run_command("python manage.py makemigrations")


def shell():
    """Start Django shell"""
    return run_command("python manage.py shell")


def test():
    """Run tests"""
    return run_command("python manage.py test")


def superuser():
    """Create superuser"""
    return run_command("python manage.py createsuperuser")


TASKS = {
    "dev": dev,
    "migrate": migrate,
    "makemigrations": makemigrations,
    "shell": shell,
    "test": test,
    "superuser": superuser,
}


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in TASKS:
        print("Available tasks:")
        for task_name, task_func in TASKS.items():
            print(f"  {task_name:15} - {task_func.__doc__}")
        print("\nUsage: uv run python tasks.py <task>")
        return 1
    
    task = TASKS[sys.argv[1]]
    return task().returncode


if __name__ == "__main__":
    sys.exit(main())

