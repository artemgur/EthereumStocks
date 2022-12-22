# Stocks Client

## Установка и запуск
Чтобы запустить приложение, необходимо выполнить следующие пункты:

- Установить [Node.js](https://nodejs.org/en/)
- Установить truffle `npm i -g truffle`
- Установить библиотеки `npm install`
- Скомпилировать контракты `truffle compile`
- Запустить Ganache
- Очистить БД в Firebase
  - Удалить все запиcи в `account`, кроме `meta`
  - В `meta` указать `total = 0`
- Импортировать аккаунты из Ganache в Metamask
- Запуск клиента `npm run start`

## Переключение блокчейна
Чтобы указать другой блокчейн, поменяйте переменную `REACT_APP_BLOCKCHAIN_URL` в .env

## Изменения Firebase
При изменении настроек Firebase, поменяйте настройки проекта в `src/contexts/FirebaseContext`
