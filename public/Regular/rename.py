import os
original = [11,19,21,22,23,24,25,26,27,28,29,31,32,33,34,35,36,37,38,39,41,43,45,47,49,51,53]
changeto = [11,19,31,32,33,34,35,36,37,38,39,51,52,53,54,55,56,57,58,59,65,69,73,77,81,85,89]
for i in range(len(original)):
    os.rename(str(original[-i])+'.png',str(changeto[-i])+'.png')