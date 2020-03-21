Three simple webpage animations, one using the canvas ojbect and two using SVGs.

Matrix Text is a variation of https://github.com/emilyxxie/green_rain
This is horizontal text scroller that uses a json object for the formatted text, 
and randomizes these letters as they pass through the screen.
Once the streams have passed through then final textblock is revealed

Bar and Line chart uses SVG objects to simulate the drawing of a combination chart that has two lines graphs and six box charts
These are drawn at different rates and objects, coloring, and animation rates can be changed in the script

Flow chart uses a SVG spline object to animate (and stop) multiple flowchart boxes along a path.

Both the bar/line and flow chart SVGs share a script and use only vanilla javascript. They use a class system in js and inherit from a superclass.

All animations are set to repeat once complete. 

Usage: this code is manual and would require some refactoring to go into production. However the framework is here to use these animations and change them as required. 

Future: All of these can be converted into plug-ins for some framework or library. The matrix text can be made to have the textblock put into an html form (with some color editing) and then create the json used for the script based on words typed into the editor.

Enjoy!
