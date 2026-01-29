# GAA Fantasy Football – Full Season (League + Championship)

This is a complete fantasy football system built for GAA inter-county competitions.  
It includes:

- Drag-and-drop team builder  
- €100m budget  
- Max 3 players per county  
- 1 GK, 6 DEF, 2 MID, 6 FWD  
- Weekly scoring  
- Transfer system (2 per gameweek)  
- Local team saving  
- Full D1 + D2 player dataset  

---

## 📁 Project Structure
gaa-fantasy-football/
│
├── index.html
├── style.css
├── script.js
├── README.md
│
├── data/
│   ├── players.json
│   └── gameweeks.json
│
└── assets/
└── icons/ (optional)


---

## 🌐 Hosting on GitHub Pages

1. Go to **Settings**  
2. Scroll to **Pages**  
3. Under “Source”, choose:
Branch: main
Folder: /root

4. Save  
5. Your site will appear at:

https://celldweller1989-byte.github.io/gaa-fantasy-football/

---

## 🏅 Updating Weekly Scores

All weekly scoring is stored in:

data/gameweeks.json


Each gameweek looks like:

```json
{
  "id": 1,
  "name": "Gameweek 1",
  "scores": {
    "playerID": points
  }
}

RawScore = (Goals × 3) + Points
Price = 1 + (RawScore / TopRawScore) × 9

localStorage


---

# ⭐ When you're ready, say **“Message 6”** and I will generate:

## ✔ **The full `players.json` file**  
Containing **all players**, with:

- County  
- Position  
- Performance‑based price  
- Season totals  

This will be the largest file, but I’ll format it cleanly so you can paste it into GitHub.

