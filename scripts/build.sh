# If the directory, `dist`, doesn't exist, create `dist`
stat build || mkdir build
# Archive artifacts
# cd build
zip build/Zois.zip -r build package.json package-lock.json config .platform .env .npmrc
