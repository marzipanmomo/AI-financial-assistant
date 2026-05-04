"""
Financial Sentiment Analysis Model
====================================
Trained on 400+ handcrafted phrases + Financial PhraseBank (2,264 expert-labeled sentences).
Architecture: HashingVectorizer + SGDClassifier (supports dynamic incremental learning).
Classifies text as: Positive, Negative, or Neutral.
"""

import pickle
import os
import numpy as np
from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

CLASSES = ["negative", "neutral", "positive"]
MODEL_PATH = os.path.join(os.path.dirname(__file__), "financial_sentiment_model.pkl")

# Stateless vectorizer — same params must be used everywhere (train, predict, partial_fit)
vectorizer = HashingVectorizer(
    ngram_range=(1, 2),
    n_features=2 ** 17,
    norm="l2",
    alternate_sign=False,
    strip_accents="unicode",
    analyzer="word",
)

TRAINING_DATA = [
    # POSITIVE
    ("The company reported record-breaking profits this quarter.", "positive"),
    ("Revenue grew by 35% year-over-year, exceeding analyst expectations.", "positive"),
    ("Strong earnings report drives stock price to all-time high.", "positive"),
    ("The firm successfully expanded into three new international markets.", "positive"),
    ("Investors are optimistic following the acquisition announcement.", "positive"),
    ("The portfolio delivered exceptional returns this fiscal year.", "positive"),
    ("Cost-cutting measures resulted in a significant improvement in margins.", "positive"),
    ("The company raised its full-year guidance amid strong demand.", "positive"),
    ("A surge in consumer spending boosted retail sector performance.", "positive"),
    ("Debt reduction efforts improved the company credit rating.", "positive"),
    ("The startup secured $50 million in Series B funding.", "positive"),
    ("Operating cash flow improved significantly in the second half.", "positive"),
    ("Stock buyback program signals management confidence in the business.", "positive"),
    ("The merger created substantial shareholder value.", "positive"),
    ("Dividend yield increased for the fifth consecutive year.", "positive"),
    ("Net income rose to its highest level in company history.", "positive"),
    ("The IPO was oversubscribed by institutional investors.", "positive"),
    ("Strong product sales drove top-line revenue growth.", "positive"),
    ("The company beat analyst estimates by a wide margin.", "positive"),
    ("Robust hiring plans signal confidence in business expansion.", "positive"),
    ("The bull market boosted retirement funds substantially.", "positive"),
    ("Compounding interest is working in my favor long-term.", "positive"),
    ("My financial plan is solid and I feel financially secure.", "positive"),
    ("I got a raise and plan to invest the difference every month.", "positive"),
    ("Passive income from dividends is growing every quarter.", "positive"),
    ("The economy is recovering faster than anticipated.", "positive"),
    ("Markets rallied sharply after the positive jobs report.", "positive"),
    ("GDP growth exceeded forecasts in the latest quarter.", "positive"),
    ("Inflation is easing giving consumers more purchasing power.", "positive"),
    ("The central bank signaled a pause in rate hikes.", "positive"),
    ("Export growth strengthened the national trade balance.", "positive"),
    ("Consumer confidence index hit a two-year high.", "positive"),
    ("Unemployment fell to its lowest level in a decade.", "positive"),
    ("Manufacturing output expanded for the third month in a row.", "positive"),
    ("Foreign direct investment reached a record level this year.", "positive"),
    ("Interest rates remain favorable for mortgage applicants.", "positive"),
    ("My savings account is growing steadily each month.", "positive"),
    ("Smart budgeting helped me pay off my credit card debt.", "positive"),
    ("I reached my emergency fund goal ahead of schedule.", "positive"),
    ("My investments are performing better than expected.", "positive"),
    ("I successfully reduced my monthly expenses by 20 percent.", "positive"),
    ("The new tax deductions increased my annual savings.", "positive"),
    ("I am on track to retire comfortably by 60.", "positive"),
    ("My credit score improved significantly after paying off loans.", "positive"),
    ("I diversified my portfolio and reduced my overall risk.", "positive"),
    ("Earnings per share surged 45 percent in the latest quarter.", "positive"),
    ("The company announced a special dividend to reward shareholders.", "positive"),
    ("Free cash flow reached its highest level in five years.", "positive"),
    ("Return on equity improved due to efficient capital allocation.", "positive"),
    ("The balance sheet strengthened with reduced long-term debt.", "positive"),
    ("Gross margins expanded by 300 basis points year-over-year.", "positive"),
    ("The company won a major government contract worth billions.", "positive"),
    ("Customer retention rates improved dramatically this year.", "positive"),
    ("The fund manager outperformed the benchmark by 12 percent.", "positive"),
    ("Assets under management grew to a record five billion dollars.", "positive"),
    ("Loan default rates decreased amid improved economic conditions.", "positive"),
    ("The bank reported its best quarter since the financial crisis.", "positive"),
    ("I paid off my student loans two years ahead of schedule.", "positive"),
    ("My net worth grew by 30 percent over the past year.", "positive"),
    ("I started investing early and my portfolio has doubled.", "positive"),
    ("I negotiated a lower interest rate on my mortgage.", "positive"),
    ("My retirement account is on track for my target date.", "positive"),
    ("Automatic savings have helped me build wealth effortlessly.", "positive"),
    ("I am debt-free for the first time in my adult life.", "positive"),
    ("My investment in index funds has delivered steady growth.", "positive"),
    ("I built a six-month emergency fund and feel financially safe.", "positive"),
    ("Trade deal signed boosting exports and investor confidence.", "positive"),
    ("Business investment surged following tax reform measures.", "positive"),
    ("Retail sales rose for the sixth consecutive month.", "positive"),
    ("The stock market closed at record highs for the week.", "positive"),
    ("The company's strong cash reserves allow for future acquisitions.", "positive"),
    ("The turnaround plan resulted in a return to profitability.", "positive"),
    ("Analysts upgraded the stock to a strong buy rating.", "positive"),
    ("Revenue guidance was raised above consensus estimates.", "positive"),
    ("The new product launch exceeded initial sales projections.", "positive"),
    ("International expansion contributed meaningfully to top-line growth.", "positive"),
    ("Profit margins expanded sharply due to operational efficiency.", "positive"),
    ("The company successfully refinanced its debt at a lower rate.", "positive"),
    ("Shareholder returns exceeded the industry average for three years.", "positive"),
    ("The company achieved its cost savings target ahead of schedule.", "positive"),
    ("Working capital management improved reducing the cash conversion cycle.", "positive"),
    ("The new CFO implemented controls that boosted financial discipline.", "positive"),
    ("The company entered a high-growth market with strong fundamentals.", "positive"),
    ("Subscription renewals reached an all-time high this quarter.", "positive"),
    ("The firm is well-positioned to benefit from industry tailwinds.", "positive"),
    ("Operating leverage drove significant margin expansion this year.", "positive"),
    ("The earnings beat triggered a wave of analyst upgrades.", "positive"),
    ("The company completed a successful debt-for-equity swap.", "positive"),
    # Advisory positive (app-style insights)
    ("Your savings rate is excellent — you are building wealth effectively.", "positive"),
    ("Great job maintaining a healthy budget with strong savings this month.", "positive"),
    ("Your investment strategy is sound and compounding is working in your favor.", "positive"),
    ("You are well on track to meet your financial goal ahead of schedule.", "positive"),
    ("Your net worth is positive and growing — excellent financial health.", "positive"),
    ("This loan has low total interest, making it a very manageable commitment.", "positive"),
    ("Your emergency fund provides a solid financial safety net.", "positive"),
    ("Your tax liability is minimal — you are keeping more of your income.", "positive"),
    ("Diversifying your investments reduces risk and improves long-term returns.", "positive"),
    ("Your debt-to-income ratio is healthy — you have strong borrowing capacity.", "positive"),
    ("Paying off this loan early will save you significant interest costs.", "positive"),
    ("Your budget shows disciplined spending with room left to save and invest.", "positive"),

    # NEGATIVE
    ("The company reported a significant net loss this quarter.", "negative"),
    ("Revenues declined by 20% amid weakening demand.", "negative"),
    ("The firm filed for bankruptcy protection after mounting debts.", "negative"),
    ("Layoffs of 5000 employees signal severe financial distress.", "negative"),
    ("The stock plunged 40% following the disappointing earnings release.", "negative"),
    ("Rising interest rates are squeezing profit margins.", "negative"),
    ("The company failed to meet revenue targets for the third consecutive quarter.", "negative"),
    ("Heavy debt load is threatening the company long-term viability.", "negative"),
    ("Supply chain disruptions caused production halts and revenue losses.", "negative"),
    ("Investor confidence collapsed after accounting irregularities were discovered.", "negative"),
    ("The fund posted its worst annual performance in a decade.", "negative"),
    ("Credit rating was downgraded to junk status.", "negative"),
    ("Operating losses widened despite aggressive cost-cutting measures.", "negative"),
    ("Cash reserves are critically low with no immediate financing plan.", "negative"),
    ("Regulatory fines wiped out an entire quarter of profits.", "negative"),
    ("The merger failed resulting in write-downs of two billion dollars.", "negative"),
    ("Bond yields spiked increasing borrowing costs for businesses.", "negative"),
    ("The company market cap erased ten billion dollars in a single session.", "negative"),
    ("Dividend payments were suspended amid the financial crisis.", "negative"),
    ("The hedge fund collapsed leaving investors with massive losses.", "negative"),
    ("I am struggling to pay my monthly bills on time.", "negative"),
    ("My debt keeps growing and I cannot keep up with payments.", "negative"),
    ("I spent more than I earned this month again.", "negative"),
    ("I have no emergency fund and my car just broke down.", "negative"),
    ("My credit card interest charges are overwhelming my budget.", "negative"),
    ("I lost significant money on a bad investment decision.", "negative"),
    ("I am behind on my mortgage payments and facing foreclosure.", "negative"),
    ("My retirement savings were wiped out in the market crash.", "negative"),
    ("I was denied a loan due to my low credit score.", "negative"),
    ("Unexpected medical expenses destroyed my financial plan.", "negative"),
    ("I owe more on my house than it is currently worth.", "negative"),
    ("Inflation is eating away at my purchasing power every month.", "negative"),
    ("I cannot afford to save anything after paying my expenses.", "negative"),
    ("I am living paycheck to paycheck with no end in sight.", "negative"),
    ("Rising rent is consuming most of my monthly income.", "negative"),
    ("The recession is causing widespread job losses across sectors.", "negative"),
    ("Stock markets entered bear territory amid global uncertainty.", "negative"),
    ("Currency devaluation eroded household savings significantly.", "negative"),
    ("Consumer spending dropped sharply due to high inflation.", "negative"),
    ("The housing market is in freefall with prices declining rapidly.", "negative"),
    ("Unemployment surged to a ten-year high.", "negative"),
    ("The banking sector faces a severe liquidity crisis.", "negative"),
    ("Fiscal deficit ballooned beyond sustainable levels.", "negative"),
    ("Economic growth stalled amid mounting geopolitical tensions.", "negative"),
    ("Write-downs of goodwill impacted earnings severely.", "negative"),
    ("The company issued a profit warning for the upcoming quarter.", "negative"),
    ("Revenue miss by a wide margin disappointed shareholders.", "negative"),
    ("Impairment charges erased all gains made during the year.", "negative"),
    ("The company share price has fallen 60% from its peak.", "negative"),
    ("Interest coverage ratio fell below the critical threshold.", "negative"),
    ("The auditors expressed going concern doubts about the company.", "negative"),
    ("Gross margin compression accelerated due to rising input costs.", "negative"),
    ("Customer churn increased sharply amid competitive pressure.", "negative"),
    ("The company burned through cash reserves at an alarming rate.", "negative"),
    ("Short sellers increased their position on the stock.", "negative"),
    ("Analysts downgraded the stock citing deteriorating fundamentals.", "negative"),
    ("The firm missed debt covenants triggering loan acceleration.", "negative"),
    ("Inventory write-offs signaled deep demand weakness.", "negative"),
    ("The IPO was pulled due to unfavorable market conditions.", "negative"),
    ("I maxed out all my credit cards and have no savings.", "negative"),
    ("I cannot afford my children education expenses.", "negative"),
    ("I have been unemployed for six months and savings are depleted.", "negative"),
    ("My investment wiped out my entire savings.", "negative"),
    ("I am drowning in high-interest debt with no way out.", "negative"),
    ("My business failed and I lost everything I invested.", "negative"),
    ("Financial stress is severely impacting my mental health.", "negative"),
    ("I cannot make the minimum payment on my loans anymore.", "negative"),
    ("The stock market crash destroyed years of investment gains.", "negative"),
    ("Rising food and energy costs are pushing families into poverty.", "negative"),
    ("The national debt has reached an unsustainable level.", "negative"),
    ("Bank failures spread panic through the financial system.", "negative"),
    ("Sovereign debt default risk increased sharply.", "negative"),
    ("Hyperinflation eroded the value of savings overnight.", "negative"),
    ("Systemic risk in the banking sector rose to dangerous levels.", "negative"),
    ("Pension funds faced massive shortfalls due to poor returns.", "negative"),
    ("The company debt-to-equity ratio reached a dangerous level.", "negative"),
    ("The product recall cost the company hundreds of millions.", "negative"),
    ("Litigation expenses weighed heavily on quarterly earnings.", "negative"),
    ("The company lost its biggest client a major revenue risk.", "negative"),
    ("Profit margin compression is expected to worsen next quarter.", "negative"),
    ("The company is at risk of delisting from the stock exchange.", "negative"),
    ("Liquidity concerns forced the company to seek emergency funding.", "negative"),
    ("Management credibility collapsed after guidance cuts.", "negative"),
    ("The company reported negative free cash flow for three consecutive quarters.", "negative"),
    ("Receivables aging worsened indicating collection difficulties.", "negative"),
    ("The company faces class action lawsuits from defrauded investors.", "negative"),
    ("Tax evasion charges resulted in massive financial penalties.", "negative"),
    ("Revenue recognition issues led to a financial restatement.", "negative"),
    ("The company is in technical default on its credit facility.", "negative"),
    ("Declining return on assets signals deteriorating business performance.", "negative"),
    # Advisory negative (app-style insights)
    ("Your expenses exceed your income — this is an unsustainable budget.", "negative"),
    ("Your savings rate is critically low and needs immediate attention.", "negative"),
    ("This loan carries very high interest and may be difficult to repay.", "negative"),
    ("Your net worth is negative — liabilities significantly exceed assets.", "negative"),
    ("Your debt-to-income ratio is dangerously high.", "negative"),
    ("At this rate you will not reach your savings goal in time.", "negative"),
    ("Your total interest cost on this loan exceeds half the principal.", "negative"),
    ("Your tax burden is very high — consider legal deductions immediately.", "negative"),
    ("You are spending far more than recommended on non-essential expenses.", "negative"),
    ("Your investment returns are negative — review your strategy.", "negative"),
    ("Your emergency fund is insufficient to cover even one month of expenses.", "negative"),
    ("Without reducing expenses you will not be able to meet your financial goals.", "negative"),

    # NEUTRAL
    ("The company will release its quarterly earnings report next week.", "neutral"),
    ("Analysts are divided on the stock near-term outlook.", "neutral"),
    ("The Federal Reserve is scheduled to meet in December.", "neutral"),
    ("The board of directors reviewed the annual financial statements.", "neutral"),
    ("The company operates in the financial services sector.", "neutral"),
    ("Shareholders will vote on the proposed merger at the annual meeting.", "neutral"),
    ("The firm employs approximately 10000 people globally.", "neutral"),
    ("The CFO presented the budget forecast for the upcoming year.", "neutral"),
    ("The government released its quarterly economic indicators.", "neutral"),
    ("The audit committee reviewed the internal controls.", "neutral"),
    ("The stock is currently trading at a price-to-earnings ratio of 18.", "neutral"),
    ("The annual report includes details on capital expenditure plans.", "neutral"),
    ("The company fiscal year ends on December 31.", "neutral"),
    ("A conference call with investors is scheduled for Thursday.", "neutral"),
    ("The new product line is expected to launch in Q3.", "neutral"),
    ("I need to create a monthly budget for my household expenses.", "neutral"),
    ("I am considering opening a new savings account.", "neutral"),
    ("What is the best way to start investing with a small amount?", "neutral"),
    ("I want to understand the difference between stocks and bonds.", "neutral"),
    ("How does compound interest work over time?", "neutral"),
    ("I am planning to track my expenses for the next six months.", "neutral"),
    ("Should I pay off debt first or start investing?", "neutral"),
    ("I am comparing different mortgage options for my first home.", "neutral"),
    ("What percentage of my income should go to savings?", "neutral"),
    ("I would like to learn about index funds.", "neutral"),
    ("How do I calculate my net worth?", "neutral"),
    ("I am reviewing my insurance coverage this year.", "neutral"),
    ("What are the tax implications of selling stocks?", "neutral"),
    ("I want to set up automatic transfers to my savings account.", "neutral"),
    ("How do I build an emergency fund from scratch?", "neutral"),
    ("GDP growth for the quarter came in at 2.1 percent.", "neutral"),
    ("The central bank held interest rates steady at its latest meeting.", "neutral"),
    ("The trade balance report showed a deficit of 65 billion dollars.", "neutral"),
    ("The consumer price index rose by 0.3 percent last month.", "neutral"),
    ("The labor market added 180000 jobs in the latest report.", "neutral"),
    ("The housing starts data will be released on Wednesday.", "neutral"),
    ("The government announced a new infrastructure spending plan.", "neutral"),
    ("The IMF revised its global growth forecast for the year.", "neutral"),
    ("The currency exchange rate fluctuated within expected ranges.", "neutral"),
    ("The budget committee is reviewing discretionary spending allocations.", "neutral"),
    ("The company is reviewing strategic alternatives for its division.", "neutral"),
    ("The board approved a new corporate governance framework.", "neutral"),
    ("The company entered into a memorandum of understanding.", "neutral"),
    ("Management will provide more details at the investor day.", "neutral"),
    ("The acquisition is subject to regulatory approval.", "neutral"),
    ("The company updated its accounting policies this quarter.", "neutral"),
    ("The earnings call transcript has been published online.", "neutral"),
    ("The index ended the day relatively unchanged.", "neutral"),
    ("The 10-year Treasury yield is currently at 4.2 percent.", "neutral"),
    ("The price-to-book ratio of the sector is around 1.5.", "neutral"),
    ("I want to know the difference between a Roth and traditional IRA.", "neutral"),
    ("What is dollar-cost averaging and how does it work?", "neutral"),
    ("Can you explain what an ETF is?", "neutral"),
    ("What is the 50-30-20 budgeting rule?", "neutral"),
    ("I am thinking about refinancing my mortgage.", "neutral"),
    ("How do I choose a financial advisor?", "neutral"),
    ("What is the difference between term and whole life insurance?", "neutral"),
    ("I want to understand how my 401k works.", "neutral"),
    ("What is a good debt-to-income ratio?", "neutral"),
    ("How does Social Security calculate my retirement benefits?", "neutral"),
    ("Can you help me understand capital gains tax?", "neutral"),
    ("What is a good credit utilization ratio?", "neutral"),
    ("How do I dispute an error on my credit report?", "neutral"),
    ("I want to learn about rebalancing my investment portfolio.", "neutral"),
    ("What is the difference between active and passive investing?", "neutral"),
    ("The unemployment rate remained steady at 4.1 percent.", "neutral"),
    ("Core inflation came in at 2.8 percent year-over-year.", "neutral"),
    ("The Purchasing Managers Index came in at 51.2 this month.", "neutral"),
    ("The yield curve inverted briefly before returning to normal.", "neutral"),
    ("The company total addressable market is estimated at 10 billion.", "neutral"),
    ("The new CFO joined from a leading investment bank.", "neutral"),
    ("The company is in the process of completing its annual audit.", "neutral"),
    ("The merger agreement is expected to close in six months.", "neutral"),
    ("Depreciation and amortization expenses totaled 120 million dollars.", "neutral"),
    ("The company maintains a revolving credit facility of 500 million.", "neutral"),
    ("The board declared a quarterly dividend of 25 cents per share.", "neutral"),
    ("Capital expenditures for the year are expected to be 300 million.", "neutral"),
    ("The firm operates across three distinct business segments.", "neutral"),
    ("The financial statements were prepared under GAAP standards.", "neutral"),
    ("I would like to open a brokerage account to start investing.", "neutral"),
    ("What is the safest way to invest money for retirement?", "neutral"),
    ("I want to understand how bonds work in a portfolio.", "neutral"),
    ("What is the difference between a mutual fund and an ETF?", "neutral"),
    ("I am looking for ways to reduce my taxable income legally.", "neutral"),
    ("The company provided forward-looking guidance for the next fiscal year.", "neutral"),
    ("The annual general meeting is scheduled for next quarter.", "neutral"),
    ("The regulatory filing deadline is at the end of this month.", "neutral"),
    ("The company disclosed its segment revenues in the footnotes.", "neutral"),
    ("Weighted average cost of capital was estimated at 8.5 percent.", "neutral"),
    ("The company has operations in over 30 countries.", "neutral"),
    ("The management team presented its five-year strategic plan.", "neutral"),
    ("The company completed its transition to a new ERP system.", "neutral"),
    ("How do I evaluate whether a stock is undervalued?", "neutral"),
    ("What factors should I consider when choosing a savings account?", "neutral"),
    ("How much of my salary should I allocate to investments?", "neutral"),
    ("What is a fiduciary financial advisor?", "neutral"),
    ("I want to compare different retirement account types.", "neutral"),
    # Advisory neutral (app-style insights)
    ("Your savings rate is moderate — there is room for improvement.", "neutral"),
    ("Your budget is balanced but leaves little margin for unexpected expenses.", "neutral"),
    ("Consider reviewing your loan terms when the opportunity arises.", "neutral"),
    ("Your net worth is near zero — focus on building assets over time.", "neutral"),
    ("The estimated tax is within the average range for your income bracket.", "neutral"),
    ("Your investment returns are in line with market averages.", "neutral"),
    ("Your monthly savings target is achievable with consistent effort.", "neutral"),
    ("Your expenses are within a reasonable range for your income level.", "neutral"),
    ("Consider consulting a financial advisor to optimize your plan.", "neutral"),
    ("Your current financial situation is stable with moderate risk.", "neutral"),
]


def download_phrasebank():
    """Download Financial PhraseBank (sentences_allagree) from GitHub at training time."""
    try:
        import requests as req
        url = (
            "https://raw.githubusercontent.com/maxwellsarpong/"
            "NLP-financial-text-processing-dataset/master/Sentences_AllAgree.txt"
        )
        r = req.get(url, timeout=15)
        r.raise_for_status()

        texts, labels = [], []
        # Format per line: "Sentence text @label"
        for line in r.text.strip().split("\n"):
            line = line.strip()
            if "@" not in line:
                continue
            sentence, label = line.rsplit("@", 1)
            sentence = sentence.strip()
            label = label.strip().lower()
            if label in ("positive", "negative", "neutral") and sentence:
                texts.append(sentence)
                labels.append(label)

        print(f"[OK] Downloaded {len(texts)} phrases from Financial PhraseBank")
        return texts, labels
    except Exception as exc:
        print(f"[WARN] Could not download Financial PhraseBank: {exc}")
        return [], []


def _load_db_examples():
    """Load app-generated training examples accumulated in the database."""
    try:
        from db import get_db
        conn = get_db()
        rows = conn.execute(
            "SELECT text, label FROM sentiment_training_data"
        ).fetchall()
        conn.close()
        texts = [r["text"] for r in rows]
        labels = [r["label"] for r in rows]
        if texts:
            print(f"[OK] Loaded {len(texts)} app-generated examples from database")
        return texts, labels
    except Exception as exc:
        print(f"[WARN] Could not load app training data from DB: {exc}")
        return [], []


def train_model():
    texts  = [item[0] for item in TRAINING_DATA]
    labels = [item[1] for item in TRAINING_DATA]

    pb_texts, pb_labels = download_phrasebank()
    texts  += pb_texts
    labels += pb_labels

    db_texts, db_labels = _load_db_examples()
    texts  += db_texts
    labels += db_labels

    print(f"\nTotal training samples: {len(texts)}")

    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.15, random_state=42, stratify=labels
    )

    X_train_vec = vectorizer.transform(X_train)
    X_test_vec  = vectorizer.transform(X_test)

    clf = SGDClassifier(
        loss="log_loss",
        alpha=0.0001,
        max_iter=200,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1,
    )
    clf.fit(X_train_vec, y_train)

    y_pred   = clf.predict(X_test_vec)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nModel Training Complete")
    print(f"   Training samples : {len(X_train)}")
    print(f"   Test samples     : {len(X_test)}")
    print(f"   Accuracy         : {accuracy * 100:.1f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=sorted(set(labels))))

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(clf, f)
    print(f"Model saved to: {MODEL_PATH}")
    return clf


def load_model():
    if not os.path.exists(MODEL_PATH):
        print("[INFO] Model not found. Training now...")
        return train_model()
    with open(MODEL_PATH, "rb") as f:
        return pickle.load(f)


def predict_sentiment(text: str) -> dict:
    clf        = load_model()
    X          = vectorizer.transform([text])
    label      = clf.predict(X)[0]
    proba      = clf.predict_proba(X)[0]
    classes    = clf.classes_
    confidence = float(np.max(proba))
    proba_dict = {cls: round(float(p), 4) for cls, p in zip(classes, proba)}
    emoji_map  = {"positive": "🟢", "negative": "🔴", "neutral": "🟡"}
    return {
        "label":         label,
        "emoji":         emoji_map.get(label, "⚪"),
        "confidence":    round(confidence * 100, 1),
        "probabilities": proba_dict,
    }


def partial_fit_model(text: str, label: str):
    """Update the model incrementally with a single new labeled example."""
    if label not in CLASSES:
        return
    try:
        clf = load_model()
        X   = vectorizer.transform([text])
        clf.partial_fit(X, [label], classes=CLASSES)
        with open(MODEL_PATH, "wb") as f:
            pickle.dump(clf, f)
    except Exception as exc:
        print(f"[WARN] partial_fit failed: {exc}")


if __name__ == "__main__":
    train_model()
    test_cases = [
        "The company reported record profits and raised its dividend.",
        "I am struggling to pay off my credit card debt every month.",
        "How do I start building an emergency fund?",
        "Markets crashed after the disappointing jobs report.",
        "I want to compare different savings account options.",
        "Revenue declined sharply as customer demand weakened.",
        "The firm successfully expanded into new markets this year.",
        "Your savings rate is excellent — keep it up!",
        "Your expenses exceed your income — this is unsustainable.",
        "Your budget looks balanced with moderate savings.",
    ]
    print("\nSample Predictions:")
    print("-" * 65)
    for text in test_cases:
        result = predict_sentiment(text)
        print(f"  Input     : {text}")
        print(f"  Sentiment : {result['label'].upper()} ({result['confidence']}% confidence)")
        print("-" * 65)
        print("─" * 65)
