const express = require('express');
const app = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended : false }));
/*
Function to justify our text : it limits the number of characters per line to 80
and returns the formated text as an array of strings 80 character long
*/
function stringLineLimiter(text) {
    let formatedText = [];
    let i, leng;
    let maxCharLine = 80;

    for (i = 0, leng = text.length; i < leng; i += maxCharLine) {
        formatedText.push(text.substr(i, maxCharLine));
    };
    
    return formatedText;
};

// Function to count the words of every text submited
let totalDailyWords = 0;
function dailyWordCounter(text) {
    let incomingWords = text.split(' ');
    
    for (let i = 0; i < incomingWords.length; i++) {
        totalDailyWords += 1;
    };
};

/*
Function to reset our daily word limit every 24h
setTimeout() takes two parameters, the first is a function and
the second is the time lapse before the function is called
*/
setTimeout(resetDailyWords, 24 * 60 * 60 * 1000);
function resetDailyWords() {
    totalDailyWords = 0;
};

// Function to validate token
function validateToken(req, res, next) {
    // Here we recover the authorization header which contains our token
    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader && authorizationHeader.split(' ')[1];
    
    if (token == null) {
        return res.status(401);
    };

    if (token === 'foo@bar.com'){
        next();
    } else {
        return res.status(403).send("Non valid token");
    };
};

// POST request that returns our token
app.post('https://exo-tic-tac-trip-angel.herokuapp.com/api/token', (req, res) => {
    const email = 'foo@bar.com';
    res.json({ email: email });
});

// POST request that returns a justified text
app.post('https://exo-tic-tac-trip-angel.herokuapp.com/api/justify', validateToken, (req, res) => {
    const text = JSON.stringify(req.body);
    dailyWordCounter(text);
    
    if (totalDailyWords > 80000) {
        res.status(402).send('Payment Required');
    } else {
        /*
        Here we call our function to justify our text and then we
        use join() to create our lines
        */
        let formatedText = stringLineLimiter(text).join("\n");
        res.status(201).send(formatedText);
    };
});

// Environment variable
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});