# micro-bank
web3 based JavaScript demo app


1. fetch

```
rm -rf dapp
rm -rf .git
git init .
git remote add  origin  https://github.com/ether-camp/micro-bank.contracts
git checkout origin/master
git fetch

git clone https://github.com/ether-camp/micro-bank
```


2. run sandbox - the usual button on the top of the screen

3. set sandbox id to the app

 in the file web3.const.js find it by nice shortcut (ctrl + e)
```
        PROVIDER: 'http:// ***host**** /sandbox/ **sandbox-id***'
```

4. install http server 

``` 
  npm install http-server -g
```

5. run in bash 
```
   http-server ./micro-bank/app/
```


