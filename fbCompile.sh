#!/bin/bash

flatc --go -o daemon/ hwfSchema.fbs
flatc --ts -o server/src/ hwfSchema.fbs
flatc --python hwfSchema.fbs
