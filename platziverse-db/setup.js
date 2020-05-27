'use strict'

const debug = require('debug')('platziverse:db:setup')
const inquirer = require('inquirer')
const chalk = require('chalk')
const { config } = require('platziverse-common/data/db')
const db = require('./')

const prompt = inquirer.createPromptModule()

async function setup () {
  if (!validateAutomatedFlag() && !await requestUserConfirmation()) {
    return console.log('Nothing happened :)')
  }

  const setupDbConfig = {
    ...config,
    logging: m => debug(m),
    setup: true
  }
  await db(setupDbConfig).catch(handleFatalError)

  console.log('Success!')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[error fatal]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

function getCommandFlags () {
  return process.argv.filter(val => val.startsWith('--') || val.startsWith('-'))
}

function validateAutomatedFlag () {
  return getCommandFlags().filter(val => val === '-y' || val === '--yes').length > 0
}

async function requestUserConfirmation () {
  return (await prompt([
    {
      type: 'confirm',
      name: 'setup',
      message: 'This will destroy your database, are you sure?'
    }
  ])).setup
}

setup()
