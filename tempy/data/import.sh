cd data/; \
  for dir in *; \
    do if [ -f "$dir/ast.csv" ]; \
    then echo $dir && cd $dir && sqlite3 $dir.db \
      'drop table if exists ticker' \
      'drop table if exists ast' \
      'drop table if exists short' \
      '.mode csv' \
      '.import ast.csv ast' \
      '.import short.csv short' \
      'alter table ast add symbol string' \
      'alter table short add symbol string' \
      "update ast set symbol = '$dir'" \
      "update short set symbol = '$dir'" \
      ".quit" \
    && cd ..; \
  fi; \
  done;
  
