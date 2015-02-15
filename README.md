# Dynamic Multilayer Perceptron 3 Algorithm

### How to install:

1. Install node.js (http://www.nodejs.org)
2. Run in project directory:
```
npm install
```

### How to run:

```
node app/[FILENAME] -i PROBLEM_ITERATIONS -j DMP3_ATTR_ITERATIONS -k BACKPROPAGATION_ITERATIONS
```

### Examples:

Overall problem iterations: 10

Information gain iterations: 1

Backpropagation iterations: 1


[BCW] Breast Cancer Wisconsin:
```
node app/breast-cancer-wisconsin-test.js  -i 10 -j 1 -k 10
```
[BC] Breast Cancer:
```
node app/breast-cancer-test.js  -i 10 -j 1 -k 10
```
[SH] Heart Statlog:
```
node app/heart-test.js  -i 10 -j 1 -k 10
```
