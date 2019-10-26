dqb-recipe-alexa

===

**Note:** support only Japanese version

Alexa Skill to read out recipes of Dragon Quest Builders

## Description

Resources to build a Alexa Skill which receive user word and find it from JSON file, and read out

## Install

1. open [Alexa Developer Console > Create New Skill](https://developer.amazon.com/alexa/console/ask/create-new-skill) on your browser
  - type your skill names
  - choose the default language
  - select `Custom` as a model to add
  - choose `Alexa-Hosted` (Node.js)" as a method to host your skill
1. open *Build* > *JSON Editor* and drag and drop JSON file which in `./models` and save the model and build it
1. open *Code* and copy and paste scripts which in `./lambda/custom` and save codes and deploy it
1. then you can try this skill by speaking "Alexa, ビルダーズワンのレシピ集を開いて"

## Licence

MIT

## Author

[wifeofvillon](https://github.com/wifeofvillon)
