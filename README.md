# voko



## QuickStart

<!-- add docs here for user -->

see [egg docs][egg] for more detail.

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### Deploy

```bash
$ npm start
$ npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.


[egg]: https://eggjs.org


### 1.配置好database/config.json、生成migrations目录

npx sequelize init:config  
npx sequelize init:migrations

### 2.生成库

[NODE_ENV=development/test/production] npx sequelize db:create --charset utf8mb4

### 3.生成初始表

npx sequelize migration:generate --name=init-users

### 4.生成表

npx sequelize db:migrate #生成表  
npx sequelize db:migrate:undo #删除表  
npx sequelize db:migrate:undo:all
