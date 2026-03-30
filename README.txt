Photostories pack for GitHub Pages

What changed from the Netlify version
- GitHub Pages workflow added at .github/workflows/pages.yml
- .nojekyll added
- build step still regenerates data/image-manifest.json from the images/ folders

How images work
- Put any image filenames you want into each story folder under images/STORYCODE/
- Supported: .jpg .jpeg .png .webp .gif .avif
- On each GitHub push, the workflow rebuilds data/image-manifest.json
- Archive cards pick a random image from that folder
- Story pages use all images from that folder

How to use on GitHub Pages
1. Put all files from this pack in the root of your repository.
2. In GitHub, open Settings > Pages.
3. Under Source, choose GitHub Actions.
4. Commit and push.
5. Wait for the Actions workflow to finish.
6. Open your Pages URL.

Important
- If you add or rename images later, commit and push again so the image manifest is rebuilt.
