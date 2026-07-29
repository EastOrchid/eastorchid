cd /d D:\.openclaw\workspace\eastorchid
git reset HEAD~1
git add *.html *.css *.js *.xml *.md
git add articles/ about/ culture/ garden/ gallery/ orchids/ videos/ docs/
git commit -m "feat: Phase 3-J text only"
git push origin main -f
