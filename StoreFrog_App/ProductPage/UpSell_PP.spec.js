const {test } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const{
    addToCart,
    login,
    NavigatetoApp,
    FindWidgetID,
    editWidget,
    NavigateToStore,
    WidgetIsDisplayed,
    WidgetNotDisplayed,
    Savewidget,
    ReloadandWait_Newpage,
    NavigateToPage,
    CreateNewWidget,
} = require('../testUtils/CommonFunctions');

const {
    deleteCrossSell,
    addSpecific,
    verifyDiscountonStore,
    discountCombo,
    desktop_displayStyle,
    discountDisplay,
    discountText,
    discountColor,
} = require('../testUtils/CrossSell');
const {
    moreQuantity,
    sameProductasUpsell,
    higherPriced,
    highestVariantasUpsell,
    editverify_Title,
    customAll,
    editverify_subtitle,
    Discount,
} = require('../testUtils/Upsell');
const {
    titleAlignment,
    titleFont,
    productPriceDisplay,
    product_titleAlignment,
    product_titleFont,
    responsivePreview,
} = require('../testUtils/visualPreference');
const {
    userName, passWord, adminURL, adminTitle, appName,
    triggerCollection,productCoupon,orderCoupon,shippingCoupon,
    productOnstore,Main_product,Secondary_product,
    edit_discountText,triggerProduct,recom_Products,discount_cent,newSubtitle,
    triggerVariant,secondaryVariant,

} = require('../testUtils/constants');
let context, iframe, widgetID, newPage, page, storeURL;
const newtitle = 'Updated Upsell - PP';
const pageName = 'Product page';

test.beforeAll(async ({browser}) => {
    context = await browser.newContext();
    page = await context.newPage(); 
    await page.goto(adminURL);
    await login(page,userName,passWord,adminTitle); 
    await page.waitForLoadState('load');
    iframe = page.frameLocator('[name=app-iframe]');
    newPage = await NavigateToStore(page);
    storeURL = await newPage.url();
    await page.bringToFront();
    await NavigateToPage(newPage,pageName,storeURL,productOnstore);
});

test.afterAll(async()=>{
    await context.close();
})

test('Create new Upsell widget for Product page', async()=>{
    fs.writeFileSync(path.resolve(__dirname, 'UpsellPP.json'), JSON.stringify({}));
    await page.waitForLoadState('load');
    await CreateNewWidget(page,iframe,appName,pageName,'Upsell');
    widgetID = await FindWidgetID(iframe);
    fs.writeFileSync(path.resolve(__dirname, 'UpsellPP.json'), JSON.stringify({ widgetID }));
    await ReloadandWait_Newpage(newPage);
    await addToCart(newPage);
    await WidgetIsDisplayed(newPage, widgetID);
});

test('Edit widget title', async()=>{
    //widgetID = '0082';
    await NavigatetoApp(page,appName);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    if(!widgetID){
        const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'UpsellPP.json'))); 
        widgetID = data.widgetID;
}
    await editWidget(iframe,page,widgetID);
    await editverify_Title(iframe,page,newPage,widgetID,newtitle);                 

});

test.describe('More quantity as upsell',async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0097';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'UpsellPP.json'))); 
            widgetID = data.widgetID;
            }
        await editWidget(iframe,page,widgetID);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
    })
    test.beforeEach(async()=>{
        await iframe.locator('.Polaris-Checkbox__Input').first().click();
    })
    test('Specific Product',async()=>{
        await moreQuantity(iframe,page,'Specific products',triggerProduct);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await addToCart(newPage);
        await sameProductasUpsell(newPage,widgetID,Main_product);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await addToCart(newPage);
        await WidgetNotDisplayed(newPage, widgetID);
    })
    test('Specific Collection',async()=>{
        await moreQuantity(iframe,page,'Specific collections',triggerCollection);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await addToCart(newPage);
        await sameProductasUpsell(newPage,widgetID,Main_product);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await addToCart(newPage);
        await WidgetNotDisplayed(newPage, widgetID);
    })
});


// Higher Priced Variant
test.describe('Higher Priced Variant', async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0097';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'UpsellPP.json'))); 
            widgetID = data.widgetID;
            }
        await editWidget(iframe,page,widgetID);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
    })
    test.beforeEach(async()=>{
        await iframe.locator('.Polaris-Checkbox__Input').nth(1).click();
    })
    test('All Products',async()=>{
        await higherPriced(iframe,page,'All products');
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,triggerVariant);
        await addToCart(newPage);
        await sameProductasUpsell(newPage,widgetID,triggerVariant);
        await highestVariantasUpsell(newPage,widgetID);
    })
    test('Specific Products',async()=>{
        await higherPriced(iframe,page,'Specific products',triggerVariant);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,triggerVariant);
        await addToCart(newPage);
        await sameProductasUpsell(newPage,widgetID,triggerVariant);
        await highestVariantasUpsell(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,secondaryVariant);
        await addToCart(newPage);
        await WidgetNotDisplayed(newPage, widgetID);
    })
    test('Specific Collections',async()=>{
        await higherPriced(iframe,page,'Specific collections',triggerCollection);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,triggerVariant);
        await addToCart(newPage);
        await sameProductasUpsell(newPage,widgetID,triggerVariant);
        await highestVariantasUpsell(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,secondaryVariant);
        await addToCart(newPage);
        await WidgetNotDisplayed(newPage, widgetID);
    })

});

test.describe('Custom Products', async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0097';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'UpsellPP.json'))); 
            widgetID = data.widgetID;
            }
        await editWidget(iframe,page,widgetID);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
    })
    test.beforeEach(async()=>{
        await iframe.locator('.Polaris-Checkbox__Input').nth(2).click();
        await iframe.getByRole('button', {name: /Manage bundles/}).click();
        await deleteCrossSell(iframe,page);
    })
    test.afterAll(async()=>{
        await iframe.getByRole('button', {name: /Manage bundles/}).click();
        await deleteCrossSell(iframe,page);    
        await addSpecific(iframe,page,'All products',undefined,recom_Products);
        await Savewidget(iframe,page);
    })
    test('All Products',async()=>{
        const newModal = await iframe.locator('.Polaris-Modal-Dialog__Modal');
        const newModalVisible = await newModal.isVisible();
        if(newModalVisible){
            await customAll(iframe,page);
        }else{
            await addSpecific(iframe,page,'All products',undefined,recom_Products);
        }
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await WidgetIsDisplayed(newPage,widgetID);
    });
    test('Specific Collections',async()=>{
        await addSpecific(iframe,page,'Specific collection',triggerCollection,recom_Products);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    test('Specific Products',async()=>{
        await addSpecific(iframe,page,'Specific product',triggerProduct,recom_Products);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,triggerProduct);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetNotDisplayed(newPage,widgetID);
    });

});
test.describe('Discounts',async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0097';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'UpsellPP.json'))); 
            widgetID = data.widgetID;
            }
        await editWidget(iframe,page,widgetID);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
    })
    test('Disable Discount',async()=>{
        await Discount(iframe,page,'disable');
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await addToCart(newPage);
        await verifyDiscountonStore(newPage,widgetID,'disable');
    })
    test('Enable discount',async()=>{
        await Discount(iframe,page,'enable',discount_cent);
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await addToCart(newPage);
        await verifyDiscountonStore(newPage,widgetID,'enable');
    })
    test('Edit DiscountText', async()=>{
        await editverify_subtitle(page,newPage,iframe,newSubtitle,widgetID);
    })
});
test.describe('Customize widget',async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0001';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'UpsellPP.json'))); 
            widgetID = data.widgetID;
        }
        await editWidget(iframe,page,widgetID);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        await iframe.locator('.widget-settings-button').click(); //Customize
        await page.waitForTimeout(3000);
    });

});