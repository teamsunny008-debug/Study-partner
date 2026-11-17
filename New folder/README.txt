STUDY PARTNER: INSTALLABLE APP WITH A REAL AI BACKEND

FILES (keep the folder structure exactly as it is)
  index.html                  the app
  manifest.webmanifest        name, colours and icons
  sw.js                       makes the app work offline
  icon.svg, icon-192.png, icon-512.png, icon-maskable-512.png
  netlify.toml                tells Netlify where the backend is
  netlify/functions/ai.js     the AI backend (holds your secret API key)

HOW THE AI PART WORKS
  The Ask AI tab is hidden. When the app starts it asks the backend "are you there?".
  If the backend answers (and has a key), the tab appears. If not, the tab stays hidden,
  so the app never shows a broken feature (for example, when you are offline).

STEP 1: GET AN API KEY
  Go to console.anthropic.com, create an account, add credit, then create an API key.
  In the console, also set a monthly spend limit so a surprise bill is not possible.

STEP 2: PUT THE FOLDER ON GITHUB
  Create a free account at github.com, make a new repository, and upload ALL files and the
  netlify folder (keep netlify/functions/ai.js inside its folders).

STEP 3: DEPLOY ON NETLIFY (the backend needs this, drag-and-drop does not run functions)
  netlify.com > Add new project > Import an existing project > GitHub > pick your repository.
  Leave the build settings as they are and press Deploy.

STEP 4: ADD YOUR KEY (never put the key inside index.html)
  Netlify > Project configuration > Environment variables > Add a variable:
     Name:  ANTHROPIC_API_KEY      Value: your key
  Optional:
     Name:  ANTHROPIC_MODEL        Value: claude-sonnet-5-5   (smarter, slower; default is claude-haiku-5-5)
  Then Deploys > Trigger deploy > Deploy project without cache.

STEP 5: OPEN YOUR LINK
  Open https://your-site.netlify.app on your phone. The Ask AI tab now appears.
  Install: Android Chrome > menu > Install app. iPhone Safari > Share > Add to Home Screen.

GOOD TO KNOW
  - Anyone who has your link can use the AI and it is charged to your key. Keep the spend limit low.
  - The Netlify free plan stops a function after about 10 seconds. If long explanations time out,
    keep the default (haiku) model.
  - After you change any file, raise the number in sw.js (const CACHE = 'study-partner-v2' to v3)
    so phones download the new version.
  - Plans, to-dos, flashcards and exams are saved on each device. The AI needs internet.
