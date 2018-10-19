# BT3103 Apps

This project comprises 3 components:
1. Python backend (`.py` files)
2. Student frontend (`/student`)
3. Faculty frontend (`/faculty`)

While the frontends should work directly, 
using the Python backend allows us to fetch 
the Google sheets data. 

## Getting Started

Before you start, ensure that you have added your SSH key at https://github.com/settings/keys. You can also check how you 
can get this key at https://help.github.com/articles/generating-an-ssh-key/. 

1. Clone this repository:

```bash
git clone git@github.com:leeyenter/bt3103-app.git
```

2. Make sure Python is installed:

```bash
python --version
```

3. Install the required Python libraries:

```bash
pip install flask, pandas, numpy
```

4. Start the Python server:

```bash
python server.py
```

5. You can then visit the page at http://localhost:5000/bt3103-app/

## Making Changes

After you make any changes, you will need to upload them back to Github (so that we can all use them).

1. Make sure you have the latest files:

```bash
git pull
```

2. Add the files that you changed:

```bash
git add <file-name>
```

3. Bundle the files together into a "commit":

```bash
git commit -m "<commit text>"
```

4. Finally, push the data up to Github:

```bash
git push
```

How it may look:

```bash
git pull
git add faculty/js/charts.js
git add faculty/js/module.js
git commit -m "Add specialised charts"
git add faculty/js/script.js
git commit -m "Fix typo in variable name"
git push
```
