# Odysseus-Academic

We welcome any contributions from the community!

To get started on developing Advisor, you will need the following tools
installed:

- NodeJS v22+ (NextJS App)
- Python 3.12 (For data processing)
- Docker (Containarization)
- Git (Version control)

After installing the tools, type these commands in your shell:

1. Clone the repository and go into directory

   ```
   git clone https://github.com/Odysseus-Academic/advisor
   cd advisor/odysseus-web
   ```

2. Install necessary packages

   ```
   npm install
   ```

3. Start docker containers

   ```
   cd ..
   docker compose up
   ```
4. Initialize the databse (this might take a while):

   ```
   npx prisma migrate reset
   ```

5. Start the development server

   ```
   npm run dev
   ```

You should now be able to navigate to
<a href="http://localhost:3000">http://localhost:3000</a> and browse the
website.
