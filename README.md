# BoBootstrapServer

Bosn's bootstrap project for Node + TypeScript, this is the server-side repository, related client-side repository can be found [here](https://github.com/bosn/BoBootstrapClient)

### Architecture

* Language & Enviaronment: TypeScript / TSLint / Node
* Server: Express / Socket.IO
* Database: Sequelize / MySQL / Redis
* Deployment: PM2
* Test: Mocha / Chai / Faker

### First Run

#### 0. Config files

Please edit the file `config/config.dev.ts` to make the configuration correct. MySQL server / redis server default configurations remain blank password and root account.

#### 1. MySQL startup & DB init

Make sure your MySQL server is installed and started, run file `database/init.sql` for creating database for this project. Make sure your DB connecting configuration is correct in the previous step.


#### 2. NPM install

Make sure you have Node.js installed. [Node Offical](https://nodejs.org/)

```bash
npm i
```

#### 3. TypeScript compile & PM2 install

Make sure you install TypeScript compiler by running `sudo npm i -g TypeScript`

```bash
tsc
```

Make sure you install pm2 for deploying our project easily.

```bash
sudo npm i pm2 -g
```

### 4. Startup redis server

Make sure your redis server is installed and can be started by command `redis-server`, if you have started, it would be fine to skip this step.

```bash
npm run start:redis
```

### 5. Startup node server

Now you can run the development server, this will start two workers, you can validate by `pm2 list` or visit `http://localhost:3000/worker` and `http://localhost:3001/worker` in web browser.

```bash
npm run dev
```

### 6. Run test cases

```bash
npm test
```

### File Structure

| Directory   |  Comments |
|:----------:|:-------------|
| .vscode | VSCode IDE files |
| database | DB script |
| src | TypeScript source code |
| src/config | config files for dev/test/prod mode |
| src/event | system node event |
| src/migrator | system version update migrators |
| src/models | sequelize model classes |
| src/models/sharedConsts | shared const files between server-side and client-side |
| src/routes | route files |
| src/scripts | running scripts |
| src/scripts/app.ts | node app |
| src/scripts/service.ts | schedulely back-end service |
| src/scripts/task.ts | task service |
| src/scripts/worker.ts | start node worker |
| src/service | service files |
| src/types | TypeScript declartion files |
| test | Test case files |
| tsconfig.json | Configuration file for TypeScript compiler |
| tslint.json | Configuration file for TSLint |
