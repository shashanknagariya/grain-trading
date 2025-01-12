interface Config {
  API_URL: string;
}

const development: Config = {
  API_URL: 'http://localhost:5000'
};

const production: Config = {
  API_URL: 'https://shashanknagariya.pythonanywhere.com'
};

export const config = import.meta.env.PROD ? production : development; 