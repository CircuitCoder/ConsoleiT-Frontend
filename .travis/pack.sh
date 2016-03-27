#!/bin/bash
if [ -d ./artifacts ]; then
  rm -r ./artifacts
fi

mkdir artifacts
tar -czvf artifacts/webpack.tar.gz ./dist
zip -1 -r artifacts/webpack.zip ./dist
