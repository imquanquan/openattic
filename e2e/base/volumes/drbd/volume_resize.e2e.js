var helpers = require('../../../common.js');
var drbdCommon = require('./drbdCommon.js');

describe('Should resize a mirrored volume', function(){
	var resize_button = element(by.css('.tc_resize_btn'));
	var clone_button = element(by.css('.tc_clone_btn'));
	var submit_button = element(by.id('bot2-Msg1'));
  	var cancel_button = element(by.id('bot1-Msg1'));

	beforeAll(function(){
		helpers.login();
		drbdCommon.create_volume(drbdCommon.volumeName, { type: 'xfs' });
	});

	it('should have a resize button instead of a clone button', function(){
		drbdCommon.volume.click();
		expect(resize_button.isDisplayed()).toBe(true);
		expect(clone_button.isDisplayed()).toBe(false);
	});

	it('should have a resize and a cancel button', function(){
		resize_button.click();
		expect(submit_button.isDisplayed()).toBe(true);
		expect(cancel_button.isDisplayed()).toBe(true);
		// No need to test the resizing in general, this is done by the Gatling tests.
		cancel_button.click();
	});

	afterAll(function(){
		helpers.delete_volume(drbdCommon.volume, drbdCommon.volumeName);
		console.log('volumes_drbd -> volume_resize.e2e.js');
	});
});
