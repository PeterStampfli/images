Flood-fill (node, target-color, replacement-color):
  1. If target-color is equal to replacement-color, return.
  2. If color of node is not equal to target-color, return.
  3. Set the color of node to replacement-color.
  4. Set Q to the empty queue.
  5. Add node to the end of Q.
  6. While Q is not empty:
  7.     Set n equal to the first element of Q.
  8.     Remove first element from Q.
  9.     If the color of the node to the west of n is target-color,
             set the color of that node to replacement-color and add that node to the end of Q.
 10.     If the color of the node to the east of n is target-color,
             set the color of that node to replacement-color and add that node to the end of Q.
 11.     If the color of the node to the north of n is target-color,
             set the color of that node to replacement-color and add that node to the end of Q.
 12.     If the color of the node to the south of n is target-color,
             set the color of that node to replacement-color and add that node to the end of Q.
 13. Continue looping until Q is exhausted.
 14. Return.

Practical implementations intended for filling rectangular areas can use a loop for the west and east directions as an optimization to avoid the overhead of stack or queue management:

Flood-fill (node, target-color, replacement-color):
 1. If target-color is equal to replacement-color, return.
 2. If color of node is not equal to target-color, return.
 3. Set Q to the empty queue.
 4. Add node to Q.
 5. For each element N of Q:
 6.     Set w and e equal to N.
 7.     Move w to the west until the color of the node to the west of w no longer matches target-color.
 8.     Move e to the east until the color of the node to the east of e no longer matches target-color.
 9.     For each node n between w and e:
10.         Set the color of n to replacement-color.
11.         If the color of the node to the north of n is target-color, add that node to Q.
12.         If the color of the node to the south of n is target-color, add that node to Q.
13. Continue looping until Q is exhausted.
14. Return.
