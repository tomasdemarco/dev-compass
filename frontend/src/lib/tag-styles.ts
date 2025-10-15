/*
  Safelist for Tailwind JIT compiler to ensure these classes are generated.

  Languages:
  bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300
  bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300
  bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300
  bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300
  bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300

  Component Types:
  bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300
  bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300
  bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300

  Protocols / APIs:
  bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300
  bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300

  AWS / Infrastructure:
  bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300
  bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300

  Data & Messaging:
  bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300
  bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300
  bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300
  bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300

  Diagram Node Highlighting:
  ring-2 ring-purple-500 ring-sky-500
*/

// This file defines the visual styles for different component tags.

export const TAG_STYLES: { [key: string]: string } = {
  // Languages
  go: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300',
  react: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  java: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  dotnet: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  python: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',

  // Component Types
  service: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  library: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  website: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',

  // Protocols / APIs
  api: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  rest: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  grpc: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300',
  iso: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300',

  // AWS / Infrastructure
  ecs: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  lambda: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  ec2: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  batch: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  s3: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',

  // Data & Messaging
  database: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300',
  postgres: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  oracle: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  redis: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
  rabbitmq: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  rabbit: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  mq: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300',
};

export const DEFAULT_TAG_STYLE = 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200';
