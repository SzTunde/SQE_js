
const path = require('path');
const checkExistsWithTimeout = require('../../utils/checkExistsWithTimeout.js');

describe("Test suite", () => {

    it("Check the title is correct", async () => {
        await browser.url('.');
        const pageTitle = await browser.getTitle();

        await expect(pageTitle).toEqual("EPAM | Software Engineering & Product Development Services");
    });

    it("Check the ability to switch Light / Dark mode", async () => {
        await browser.maximizeWindow();
        await browser.url('.');

        //Wait for cookie banner, accept cookies, wait for banner to disappear
        const cookie_banner = await $("div[class='ot-sdk-container']");
        const accept_button = await $('button#onetrust-accept-btn-handler');
        await cookie_banner.waitForDisplayed(2000);
        await accept_button.waitForClickable();
        await accept_button.click();
        await cookie_banner.waitForDisplayed(2000, true);

        //Check that theme is dark or not
        const theme_dark = await $("body.fonts-loaded.dark-mode");
        const theme_dark_exist = await theme_dark.isExisting();

        //Click theme-switcher
        const theme_switcher = await $("div.header__content > section.theme-switcher-ui > div.theme-switcher");
        await theme_switcher.click();

        //Check that theme changed
        const theme_dark2 = await $("body.fonts-loaded.dark-mode");
        await expect(await theme_dark2.isExisting()).not.toEqual(theme_dark_exist);

    });

    it("Check that allow to change language to UA", async () => {
        await browser.url('.');

        //Click language change button in the header
        const lang_change_button = await $("button.location-selector__button")
        await lang_change_button.click();

        //Click UA language
        const ua_lang = await $("a[class='location-selector__link'][lang='uk']")
        await ua_lang.waitForClickable();
        await ua_lang.click();

        //Check that the language changed
        await expect(browser).toHaveUrlContaining('.ua');
    });

    it("Check the policies list", async () => {
        await browser.url('.');

        //Scroll to the footer
        const footer = await $(".footer-inner");
        await footer.scrollIntoView();
        //await footer.isDisplayedInViewport();

        //Check the list: COOKIE POLICY, OPEN SOURCE, APPLICANT PRIVACY NOTICE, PRIVACY POLICY, WEB ACCESSIBILITY
        const policies = await $(".policies-links-wrapper");
        const expected_policies = "INVESTORS\nOPEN SOURCE\nPRIVACY POLICY\nCOOKIE POLICY\nAPPLICANT PRIVACY NOTICE\nWEB ACCESSIBILITY"
        await expect(await policies.getText()).toEqual(expected_policies);
    });

    it("Check that allow to switch location list by region", async () => {
        await browser.url(".");

        //Scroll to locations
        const locations = await $("div.content-container.parsys > div:nth-child(16)");
        await locations.scrollIntoView();

        //Regions are presented: [AMERICAS, EMEA, APAC] 
        const regions = await $(".tabs-23__ul.js-tabs-links-list");
        await expect(await regions.getText()).toEqual("AMERICAS\nEMEA\nAPAC");

        //Allows to switch to another loaction, click one check it is active, click another one check that is active
        const tab1 = await $("a[data-item='1']");
        await tab1.click();
        await expect(await tab1.getAttribute("aria-selected")).toEqual("true");

        const tab0 = await $("a[data-item='0']");
        await tab0.click();
        await expect(await tab0.getAttribute("aria-selected")).toEqual("true");
    });

    it("Check the search function", async () => {
        await browser.url('.');

        //Click search icon
        const search_icon = await $(".search-icon")
        await search_icon.click();

        //Add search term
        const search_input = await $('input[id="new_form_search"]');
        await search_input.waitForDisplayed(2000);
        await search_input.waitForClickable(2000);
        await search_input.setValue("AI");

        //Click Find
        const find_button = await $(".bth-text-layer")
        await find_button.click();

        //Check search result items are displayed
        const search_results = await $("div.search-results__items");
        await expect(search_results).toHaveChildren();;
    });

    it("Check form's fields validation", async () => {
        await browser.url("./about/who-we-are/contact");

        //Click Submit
        const submit_button = await $("button[type='Submit']")
        await submit_button.click();

        //Check that the required fields threw an error
        const first_name = 'First Name*\nThis is a required field';
        const last_name = 'Last Name*\nThis is a required field';
        const email = 'Email*\nThis is a required field';
        const phone = 'Phone*\nThis is a required field';
        const how_hear = 'How did you hear about EPAM?*';
        const policy = `I consent to EPAM Systems, Inc. ("EPAM") processing my personal information as set out in the Privacy Policy and Cookie Policy and that, given the global nature of EPAM's business, such processing may take place outside of my home jurisdiction.\n` + '*';

        const required_fields_array = await browser.$$(".validation-field").map(elem => elem.getText());
        await expect(await required_fields_array).toEqual([first_name, last_name, email, phone, how_hear, policy]);
    });

    it("Check that the Company logo on the header lead to the main page", async () => {
        await browser.url("./about");

        //Click company logo in the header
        const company_logo = await $(".header__logo-container.desktop-logo")
        await company_logo.click();

        //Check URL
        await expect(await browser).toHaveUrl('https://www.epam.com/');
    });

    it('Check that allows to download report ', async() => {
        await browser.url('./about');

        //Click Download button
        const downloadButton = await $("a[href='https://www.epam.com/content/dam/epam/free_library/EPAM_Corporate_Overview_Q4_EOY.pdf']");
        await downloadButton.waitForClickable();
        await downloadButton.click();

        //Expected filename
        const fileName = "EPAM_Corporate_Overview_Q4_EOY.pdf";

        const filePath = path.join(global.downloadDir, fileName);

        //Check that the file with the expected filename was downloaded
        await browser.call (() => {
            return checkExistsWithTimeout(filePath, 60000);
        });
    });

});
