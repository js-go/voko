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


### 1.新建数据库 -p 为密码选项

mysql -u root -p -e 'CREATE DATABASE IF NOT EXISTS `voko_default`;'  
mysql -u root -p -e 'CREATE DATABASE IF NOT EXISTS `voko_unittest`;'

### 2.初始化 Migrations 配置文件和目录

npx sequelize init:config
npx sequelize init:migrations

### 3.生成文件

npx sequelize migration:generate --name=init-users

### 4.生成表

npx sequelize db:migrate #生成表
npx sequelize db:migrate:undo #删除表
npx sequelize db:migrate:undo:all
