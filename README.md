Fork the repository and set up these secrets in Settings -> Security -> Secrets:

(required) ShrimpyApiKey
-
(required) ShrimpyApiSecret
-
You can generate them in Shrimpy dashboard -> Settings -> Security & API -> API Keys

(required) NotificationEmail
-
E-mail address for notifications

(optional) TargetBalance
-
default: 250.00

Target portfolio balance for all coins.

(optional) TakeprofitPercent
-
default: 7.00

Take profit level (in %).

(optional) RefillPercent
-
default: 7.00

Refill level (in %).

(optional) IgnoredSymbols
-
default: USDT,BTC

Ignores only BTC or only USDT single coin portfolios by default ("default" portfolios). 

(optional) IgnoredAccounts
-
default: none

format: comma separated list of ids

If you don't want to track certain portfolios you can provide the list of ids to disable them from notifications (the id is in the notification e-mail)

(optional) PortfolioTargetBalanceOverride
- 
default: none

format: comma separated list of accounts with balances after a colon, example: 220181:150.00,220195:150.0

If you want to have different target balances for each portfolio (the id is in the notification e-mail)


Full instructions to follow

