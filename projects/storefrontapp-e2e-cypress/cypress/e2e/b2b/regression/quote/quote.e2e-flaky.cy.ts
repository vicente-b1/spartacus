/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as quote from '../../../../helpers/quote';

const POWERTOOLS = 'powertools-spa';
const TESTPRODUCTHAMMERDRILLINGID = '3887130';
const TESTPRODUCTHAMMERDRILLINGNAME = 'DH40MR';
const BUYER_EMAIL = 'gi.sun@pronto-hw.com';
const BUYER_PASSWORD = '12341234';
const BUYER_USER = 'Gi Sun';
const SALESREP_EMAIL = 'darrin.hesser@acme.com';
const SALESREP_PASSWORD = '12341234';
const SALESREP_USER = 'Darrin  Hesser';
const MSG_TYPE_WARNING = '[GlobalMessage] Warning';
const getTestTitle = (
  test: Mocha.Suite = (Cypress as any).mocha.getRunner().suite.ctx.test
): string =>
  test.parent?.title
    ? `${getTestTitle(test.parent)} -- ${test.title}`
    : test.title;

context('Quote', () => {
  let globalMessageSettings: any;
  beforeEach(() => {
    globalMessageSettings = {
      globalMessages: {
        [MSG_TYPE_WARNING]: {
          timeout: 10000,
        },
      },
    };
    cy.cxConfig(globalMessageSettings);
    quote.log('visit default url', 'beforeEach');
    cy.visit('/');
    quote.log(`login as ${BUYER_USER}`, 'beforeEach');
    quote.login(BUYER_EMAIL, BUYER_PASSWORD, BUYER_USER);
    quote.log('registerGetQuoteRoute', 'beforeEach');
    quote.registerGetQuoteRoute(POWERTOOLS);
  });

  describe('Request quote process', () => {
    it('should display a message and disable submit button if threshold is not met', () => {
      quote.log('requestQuote', getTestTitle());
      quote.requestQuote(POWERTOOLS, TESTPRODUCTHAMMERDRILLINGID, '1');
      quote.log('checkQuoteInDraftState', getTestTitle());
      quote.checkQuoteInDraftState(false, TESTPRODUCTHAMMERDRILLINGID);
    });

    it('should be possible(submit) if threshold is met', () => {
      quote.log('requestQuote', getTestTitle());
      quote.requestQuote(POWERTOOLS, TESTPRODUCTHAMMERDRILLINGID, '30');
      cy.url().as('quoteURL');
      quote.log('checkQuoteInDraftState', getTestTitle());
      quote.checkQuoteInDraftState(true, TESTPRODUCTHAMMERDRILLINGID);
      quote.log('addCommentAndWait', getTestTitle());
      quote.addCommentAndWait(
        'Can you please make me a good offer for this large volume of goods?'
      );
      quote.log('checkComment', getTestTitle());
      quote.checkComment(
        1,
        'Can you please make me a good offer for this large volume of goods?'
      );
      quote.log('addItemCommentAndWait', getTestTitle());
      quote.addItemCommentAndWait(
        TESTPRODUCTHAMMERDRILLINGNAME,
        'since there is a newer model out, is it possible to get a discount for this item?'
      );
      quote.log('checkItemComment', getTestTitle());
      quote.checkItemComment(
        2,
        TESTPRODUCTHAMMERDRILLINGNAME,
        'since there is a newer model out, is it possible to get a discount for this item?'
      );
      quote.log('clickItemLinkInComment', getTestTitle());
      quote.clickItemLinkInComment(2, TESTPRODUCTHAMMERDRILLINGNAME);
      quote.log('checkLinkedItemInViewport', getTestTitle());
      quote.checkLinkedItemInViewport(1);
      quote.log('submitQuote', getTestTitle());
      quote.submitQuote();
      quote.log('checkQuoteState Submitted', getTestTitle());
      quote.checkQuoteState(quote.STATUS_SUBMITTED);
      quote.log('checkCommentsNotEditable', getTestTitle());
      quote.checkCommentsNotEditable();
    });

    it('should edit name, description and quantity of items within a quote draft (CXSPA-3852)', () => {
      quote.log('requestQuote', getTestTitle());
      const amount: number = 30;
      quote.requestQuote(
        POWERTOOLS,
        TESTPRODUCTHAMMERDRILLINGID,
        amount.toString()
      );
      cy.url().as('quoteURL');
      quote.log('checkQuoteInDraftState', getTestTitle());
      quote.checkQuoteInDraftState(true, TESTPRODUCTHAMMERDRILLINGID);
      let itemIndex = 1;
      quote.log(
        `Check if the item exists at Index ${itemIndex}`,
        getTestTitle()
      );
      quote.checkItemAtIndexExists(
        itemIndex,
        TESTPRODUCTHAMMERDRILLINGID,
        true
      );
      quote.log(
        `validate the item quantity at index ${itemIndex} equals ${amount}`,
        getTestTitle()
      );
      quote.validateItemQuantity(itemIndex, amount.toString());
      quote.log('increase the item  quantity by 1', getTestTitle());
      quote.changeItemQuantityOnClick(itemIndex, '+');
      quote.log(
        `validate the item quantity at index ${itemIndex} equals ${amount + 1}`,
        getTestTitle()
      );
      quote.validateItemQuantity(itemIndex, (amount + 1).toString());
      quote.log('decrease the item  quantity by 1', getTestTitle());
      quote.changeItemQuantityOnClick(itemIndex, '-');
      quote.log(
        `validate the item quantity at index ${itemIndex} equals ${amount}`,
        getTestTitle()
      );
      quote.validateItemQuantity(itemIndex, amount.toString());
      quote.log('change the item  quantity to 1', getTestTitle());
      quote.changeItemQuantityWithInputField(1, '1');
      quote.log(
        `validate the item quantity at index ${itemIndex} equals 1`,
        getTestTitle()
      );
      quote.validateItemQuantity(itemIndex, '1');
      quote.log(
        'check the "Submit Quote" button is not clickable since the threshold is not met',
        getTestTitle()
      );
      quote.checkSubmitButton(false);
      quote.checkItemAtIndexExists(
        itemIndex,
        TESTPRODUCTHAMMERDRILLINGID,
        true
      );
      quote.removeItemOnClick(itemIndex);
      quote.checkItemAtIndexExists(
        itemIndex,
        TESTPRODUCTHAMMERDRILLINGID,
        false
      );

      //########### not yet implemented ########
      //ToDo: edit quote name
      //ToDO: edit quote description
    });

    it('should logout as user and login seller in asm mode ', () => {
      quote.log('requestQuote', getTestTitle());
      quote.requestQuote(POWERTOOLS, TESTPRODUCTHAMMERDRILLINGID, '30');
      quote.log('create Alias for quoteURL', getTestTitle());
      cy.url().as('quoteURL');
      quote.log('checkQuoteInDraftState', getTestTitle());
      quote.checkQuoteInDraftState(true, TESTPRODUCTHAMMERDRILLINGID);
      quote.log('submitQuote', getTestTitle());
      quote.submitQuote();
      quote.log('checkQuoteState Submitted', getTestTitle());
      quote.checkQuoteState(quote.STATUS_SUBMITTED);
      quote.log(`logout user ${BUYER_USER}`, getTestTitle());
      quote.logoutBuyer(POWERTOOLS);
      quote.log('enable ASM mode', getTestTitle());
      quote.enableASMMode(POWERTOOLS);
      quote.log(`login sales rep ${SALESREP_USER} in ASM mode`, getTestTitle());
      quote.loginASM(POWERTOOLS, SALESREP_EMAIL, SALESREP_PASSWORD);
    });
  });

  // these tests should be removed, as soon as the quote list navigation is part of the above process tests
  describe('Quote list', () => {
    it('should be accessible from My Account', () => {
      quote.navigateToQuoteListFromMyAccount();
      quote.checkQuoteListPresent();
    });

    it('should be accessible from quote details', () => {
      quote.requestQuote(POWERTOOLS, TESTPRODUCTHAMMERDRILLINGID, '1');
      quote.navigateToQuoteListFromQuoteDetails();
      quote.checkQuoteListPresent();
    });
  });
});
