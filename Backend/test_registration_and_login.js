
import http from 'http';
import { faker } from '@faker-js/faker';

const randomEmail = faker.internet.email();
const password = 'password123';

const registerData = JSON.stringify({
  email: randomEmail,
  password: password,
  displayName: faker.person.fullName(),
});

const registerOptions = {
  hostname: 'localhost',
  port: 4001,
  path: '/users/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(registerData),
  },
};

const loginData = JSON.stringify({
  email: randomEmail,
  password: password,
});

const loginOptions = {
  hostname: 'localhost',
  port: 4001,
  path: '/users/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData),
  },
};

const makeRequest = (options, data) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: body,
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(data);
    req.end();
  });
};

const runTest = async () => {
  try {
    console.log('Attempting to register a new user...');
    const registerRes = await makeRequest(registerOptions, registerData);
    console.log('Registration Status:', registerRes.statusCode);
    console.log('Registration Response:', registerRes.body);

    if (registerRes.statusCode === 201) {
      console.log('User registered successfully. Now attempting to log in...');
      const loginRes = await makeRequest(loginOptions, loginData);
      console.log('Login Status:', loginRes.statusCode);
      console.log('Login Response:', loginRes.body);
    } else {
      console.log('Registration failed. Aborting login test.');
    }
  } catch (error) {
    console.error('An error occurred during the test:', error);
  }
};

runTest();
