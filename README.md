# Study Planner LD4 Backend

## Run locally
1. Install Node.js.
2. Open this folder in a terminal.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000`.

## Implemented LD4 functionality
- SQLite database is created automatically in `data/database.sqlite`.
- Tables: `users` and `tasks`.
- Registration and login use bcrypt password hashing and JWT sessions.
- Random users can view demo data only.
- Registered users can create, search, update, complete, duplicate, and delete their own tasks.
- Edit/delete queries are protected by `WHERE id=? AND user_id=?`, so users cannot modify tasks created by another user.
- Profile changing is available from the sidebar profile card.
- Forms validate email, password, dates, priority, task types, and unsupported characters before writing to the database.
- Search by task title is beside the All / Active / Completed filters. If there are no matching results, the page shows `Not found`.

## Migration / deployment plan
1. Copy application files: `server.js`, `auth.js`, `tasks.js`, `db.js`, `package.json`, `public/`, and, if preserving data, `data/database.sqlite`.
2. On the new server, install Node.js and run `npm install`.
3. Set environment variables if needed, especially `PORT` and a secure `JWT_SECRET`.
4. Start the app with `npm start` or a process manager such as PM2.
5. Configure the domain or reverse proxy to point to the selected port.
6. If moving existing data, place `database.sqlite` inside the `data/` folder before starting the server.
7. Test after migration: registration, login, logout, profile update, task create/read/update/delete, task search including `Not found`, permissions between two users, and invalid form inputs.
