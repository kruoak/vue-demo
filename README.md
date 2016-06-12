# TO DEPLOY TO SERVER
```
git init
git remote add origin http://202.129.206.254:10080/sak/nbc-claret.git
git config core.sparseCheckout true

echo dist >> .git/info/sparse-checkout
echo package.json >> .git/info/sparse-checkout
git pull origin
npm install --production
```
