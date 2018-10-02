import { shallow, render, mount } from 'enzyme';
import { it, describe } from 'mocha';
import assume from 'assume';
import sinon from 'sinon';
import React from 'react';

//
// Ensure that we import static files without dying.
//
import jpg from './test.jpg';
import x from './test.css';
import './test.css';

describe('setup-env', function () {
  describe('step: babel', function () {
    it('should work or this test suite would be dead', function () {
      assume(true).is.true();
    });
  });

  describe('step: env', function () {
    it('has set the `NODE_ENV` to test', function () {
      assume(process.env.NODE_ENV).equals('test');
    });
  });

  describe('step: enzyme', function () {
    class Example extends React.Component {
      render() {
        return (
          <div>Setup Env</div>
        );
      }
    }

    it('has configured enzyme with the correct adapter', function () {
      const configuration = require('enzyme/build/configuration');

      assume(configuration.get('adapter')).is.not.a('undefined');
    });

    it('can { shallow }', function () {
      const enzyme = shallow(<Example />);

      assume(enzyme.text()).equals('Setup Env');
    });

    it('can { render }', function () {
      const enzyme = render(<Example />);

      assume(enzyme.text()).equals('Setup Env');
    });

    it('can { mount }', function () {
      const enzyme = mount(<Example />);

      assume(enzyme.text()).equals('Setup Env');
    });
  });

  describe('step: jsdom', function () {
    it('intoduces globals', function () {
      assume(global.window).is.not.a('undefined');
      assume(global.document).is.not.a('undefined');
      assume(global.navigator).is.not.a('undefined');
    });

    it('uses the localhost instead of about:blank', function () {
      assume(location.href).equals('http://localhost/');
    });
  });

  describe('step: assets', function () {
    it('allows importing of static files', function () {
      assume(x).is.a('string');
      assume(x).contains('test/test.css');
    });

    it('can be processed with a custom loader', function () {
      assume(jpg).is.a('object');
      assume(jpg.content).is.a('buffer');
      assume(jpg.data).equals('this file is processed by a custom loader');
    });
  });

  describe('step: assert', function () {
    it('registers plugins automatically', function () {
      const spy = sinon.spy();

      spy();
      assume(spy).is.spylike();
    });
  });
});
