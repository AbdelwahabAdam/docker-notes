# Docker Practice Exams

Ten self-contained mock exams covering **all core Docker concepts**. Each directory is a full workspace: **questions**, **answers**, and **starter assets** in one place. Every exam is a 60–90 minute assessment with **10 tasks** — same skill areas, **different scenarios, names, ports, and image versions**.

## Concepts Covered (Every Exam)

| # | Topic | Skills Tested |
|---|-------|---------------|
| 1 | Container Deployment | docker run, -d, -p, --name, --restart, docker ps |
| 2 | Image Creation | Dockerfile, docker build, docker tag |
| 3 | Persistent Storage | Named volumes, data survival after container removal |
| 4 | Host Bind Mount | Bind mounts, live file sync without rebuild |
| 5 | Networking | Custom networks, container DNS, inter-container communication |
| 6 | Environment Variables | -e, --env-file, runtime configuration |
| 7 | Docker Compose | Multi-service stacks, volumes, networks, docker compose up |
| 8 | Troubleshooting | docker logs, docker inspect, exit-code debugging |
| 9 | Security | Non-root user, USER directive, UID verification |
| 10 | Production Challenge | Custom image, healthcheck, volumes, networks, env, restart policy, Compose |

## Exams (self-contained directories)

| # | Theme | Directory |
|---|-------|-----------|
| 1 | Online Bookstore | [exam-01-bookstore](./exam-01-bookstore/) |
| 2 | Travel Booking Portal | [exam-02-travel](./exam-02-travel/) |
| 3 | Fitness Tracker API | [exam-03-fitness](./exam-03-fitness/) |
| 4 | Photo Gallery Service | [exam-04-gallery](./exam-04-gallery/) |
| 5 | Inventory Management | [exam-05-inventory](./exam-05-inventory/) |
| 6 | Weather Dashboard | [exam-06-weather](./exam-06-weather/) |
| 7 | Chat Messaging App | [exam-07-chat](./exam-07-chat/) |
| 8 | Document Archive | [exam-08-archive](./exam-08-archive/) |
| 9 | Online Learning Platform | [exam-09-learning](./exam-09-learning/) |
| 10 | Healthcare Patient Portal | [exam-10-healthcare](./exam-10-healthcare/) |

Each folder contains:

- **questions.md** — exam tasks (paths are relative to that folder)
- **answers.md** — solutions (check after attempting)
- Task subfolders — FE/BE files, env templates, sample data; you add Dockerfiles, Compose, and *student-created* files

### Typical layout (per exam)

```text
exam-XX-theme/
├── README.md
├── questions.md
├── answers.md
├── task02-*/          # FE HTML + you add Dockerfile
├── task04-*/          # Bind-mount source files
├── task06/            # .env / .env.example
├── task07-compose/    # You add docker-compose.yml (+ optional BE)
├── task08-troubleshooting/
├── task09-security/   # You add Dockerfile
└── task10-prod/       # FE + you add Dockerfile, .dockerignore, compose
```

## How to Use

1. Open an exam directory (e.g. exam-01-bookstore/).
2. Read **questions.md** and explore the task subfolders.
3. Run commands from that exam folder; use the **exact image names, tags, and ports** in each task.
4. Create only files marked *student-created* (Dockerfile, Compose, etc.).
5. Compare with **answers.md** after attempting all tasks.

## Prerequisites

- Docker Engine 24+ recommended
- Docker Compose v2 (docker compose)
- On Windows: use forward slashes in volume paths (G:/path/to/practice/exam-XX-theme/...)

## Reference

See [docker-notes.md](../docker-notes.md) for definitions, command reference, and examples.
