@echo off
cd /d D:\.openclaw\workspace\eastorchid
echo Resetting to clean state...
git reset --hard 313ebb6 >nul 2>&1
echo Adding text files...
git add *.html *.css *.js *.xml *.md
git add articles/ about/ culture/ garden/ gallery/ orchids/ videos/ docs/
git add assets/video-library/VIDEO_INDEX.md
git add sitemap.xml
echo Committing...
git commit -m "Phase 3-J text changes - garden upgrade + gallery + video lib"
echo Pushing text only...
git push origin main -f
echo Done!
pause
