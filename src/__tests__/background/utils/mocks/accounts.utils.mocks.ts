import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';

const constants = {
  fileData: {
    encrypted: {
      msg: '000000c6000000230000005600000032000000a000000041000000660000009bF+Es8H+yzc6IXr5xCD7YU83e/Q4e+9vXh2fgSdk/Vyv17HJOJAGLr2a6Nt1t0UK21ZftWIuZ/PRsf7Oyw1Lz1GRHajWpWywYkfr4/8HGxYRt019dqu4fuFQz+rF2+F3pXFyYAQwbhc5mgWppdSBEzzGhRb4nhspzPLe2BjlGGyGz9r1oWmUd87TNXE4oD6GvC508F6NpX1o6fqK60NKf2gBdFgwtxI0UXdNxis3BCQRqnMbLs5Z1O3UPWOIaB6kcX+ezn+BPH1e+wHuJagYBJ7AJBbfXsqYGqmqxEb8XR6MzhnPyl3+nipzF6KShJyP4zaXfoI/h3BNHO2OCj5MNOcDWySVzNk3JOhcyZyPZw6ONQonOaOelTaEUP8fK4VRcHP2y8PXqQnHgrDdUXX5504sBQ8xrZneRUgxpDB2OQEP7epxfc6IWoI3gvQptscKVHMj/ySP1qYnk/C0KlPM+7P6yV8MnMO+hrqHxADr5CVc=',
      password: mk.user.one,
    },
    invalid: {
      msg: '954f487f879b7e847dd374825e6b15a150c7f4c77dc0646188d89d757a6bb0bagCmc00j0czkBe86wm587tLAhu0mPRYe0yN1P8I49RA9/Ua62NJUytBCUV4ob1g2e',
      password: 'new key',
    },
    original: [accounts.local.justTwoKeys],
  },
};

const mocks = {};

const spies = {};

export default { constants, mocks, spies };
