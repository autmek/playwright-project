const {test } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const{
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
} = require('../testUtils/CommonFunctions');

const {
    CreateNewWidget,
    deleteCrossSell,
    addSpecific,
    Discount,
    verifyDiscountonStore,
    editverify_subtitle,
    discountCombo,
    desktop_displayStyle,
    discountDisplay,
    discountText,
    discountColor,
    editverify_Title,
} = require('../testUtils/CrossSell');
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
} = require('../testUtils/constants');
let context, iframe, widgetID, newPage, page, storeURL;
const newtitle = 'Updated CrossSell - PP';
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
// Create CrossSell PR on product page
test('Create new crossSell widget(All products) for Product page', async()=>{
    fs.writeFileSync(path.resolve(__dirname, 'CrossellPP.json'), JSON.stringify({}));
    await CreateNewWidget(page,iframe,appName,pageName,recom_Products);
    widgetID = await FindWidgetID(iframe);
    fs.writeFileSync(path.resolve(__dirname, 'CrossellPP.json'), JSON.stringify({ widgetID }));
    await ReloadandWait_Newpage(newPage);
    await WidgetIsDisplayed(newPage, widgetID);
});

test('Edit title', async()=>{
    //widgetID = '0082';
    await NavigatetoApp(page,appName);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    if(!widgetID){
        const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CrossellPP.json'))); 
        widgetID = data.widgetID;
}
    await editWidget(iframe,page,widgetID);
    await editverify_Title(iframe,page,newPage,widgetID,newtitle);                 
});

test.describe('Products to recommend', async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0001';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CrossellPP.json'))); 
            widgetID = data.widgetID;
            }
        await editWidget(iframe,page,widgetID);
        await ReloadandWait_Newpage(newPage)
        await WidgetIsDisplayed(newPage,widgetID);
    })
    test.beforeEach(async()=>{
        await iframe.getByRole('button', {name: /Manage bundles/}).click();
        await page.waitForTimeout(1000);
        await deleteCrossSell(iframe,page);    
    })
    test.afterAll(async()=>{
        await iframe.getByRole('button', {name: /Manage bundles/}).click();
        await page.waitForTimeout(1000);
        await deleteCrossSell(iframe,page);    
        await addSpecific(iframe,page,'All products',undefined,recom_Products);
        await Savewidget(iframe,page);
    })
    test('Cross-Sell for specific products', async()=>{

        await addSpecific(iframe,page,'Specific product',triggerProduct,recom_Products);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetIsDisplayed(newPage, widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetNotDisplayed(newPage, widgetID);
    });
    
    test('Cross-Sell for specific collection', async()=>{
        await addSpecific(iframe,page,'Specific collection',triggerCollection,recom_Products);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetIsDisplayed(newPage, widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetNotDisplayed(newPage, widgetID);
    });
    
})

test.describe('Discounts',async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0084';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CrossellPP.json'))); 
            widgetID = data.widgetID;
            }
        await editWidget(iframe,page,widgetID);
        await ReloadandWait_Newpage(newPage)
        await WidgetIsDisplayed(newPage,widgetID);
    })
    test('Disable Discount',async()=>{
        await Discount(iframe,'disable');
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage)
        await verifyDiscountonStore(newPage,widgetID,'disable');
    })
    test('Enable discount',async()=>{
        await Discount(iframe,'enable',discount_cent);
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage)
        await verifyDiscountonStore(newPage,widgetID,'enable');
    })
    test('Edit DiscountText', async()=>{
        await editverify_subtitle(page,newPage,iframe,newSubtitle,widgetID);
    })
});
/*
test.describe('Discount Combination', async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0082';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CrossellPP.json'))); 
            widgetID = data.widgetID;
        }    
        await editWidget(iframe,page,widgetID);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        await Discount(iframe,'enable',discount_cent);
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage)
        await verifyDiscountonStore(newPage,widgetID,'enable');    
    })
    test('Other product discounts',async()=>{
        await discountCombo(iframe,'product');
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);

    })
});
*/
test.describe('Customize widget',async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0001';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CrossellPP.json'))); 
            widgetID = data.widgetID;
        }
        await editWidget(iframe,page,widgetID);
        await ReloadandWait_Newpage(newPage)
        await WidgetIsDisplayed(newPage,widgetID);

        await iframe.locator('.widget-settings-button').click(); //Customize
        await page.waitForTimeout(3000);
    });
    test('Dislay_Style(On Desktop) - Grid', async()=>{
        await desktop_displayStyle(iframe,page,newPage,widgetID,'grid');
    });
    test('Dislay_Style(On Desktop) - Popup', async()=>{
        await desktop_displayStyle(iframe,page,newPage,widgetID,'popup');
    });
    test('Dislay_Style(On Desktop) - List', async()=>{
        await desktop_displayStyle(iframe,page,newPage,widgetID,'list');
    });
    test('Widget title Alignment - Left', async()=>{    
        await titleAlignment(iframe,page,newPage,widgetID,'left');
    });

    test('Widget title Alignment - Center', async()=>{    
        await titleAlignment(iframe,page,newPage,widgetID,'Center');
    });

    test('Widget title Alignment - Right', async()=>{    
        await titleAlignment(iframe,page,newPage,widgetID,'Right');
    });
    test('Widget title font color', async()=>{    
        await titleFont(iframe,page,newPage,widgetID);
    });
    test('Product price Display', async()=>{    
        await productPriceDisplay(iframe,page,newPage,widgetID,'disable');
        await page.waitForTimeout(2000);
        await productPriceDisplay(iframe,page,newPage,widgetID,'enable');
    });
    test('Product title alignment - Left', async()=>{    
        await product_titleAlignment(iframe,page,newPage,widgetID,'left');
    });

    test('Product title alignment - Center', async()=>{    
        await product_titleAlignment(iframe,page,newPage,widgetID,'center');
    });

    test('Product title alignment - Right', async()=>{    
        await product_titleAlignment(iframe,page,newPage,widgetID,'right');
    });
    test('Product title font', async()=>{    
        await product_titleFont(iframe,page,newPage,widgetID);
    });
    test('Discount text display', async()=>{    
        await discountDisplay(iframe,page,newPage,widgetID,'disable');
        await page.waitForTimeout(2000);
        await discountDisplay(iframe,page,newPage,widgetID,'enable');
    });
    test('Edit Discount Text',async()=>{
        await discountText(iframe,page,newPage,widgetID,edit_discountText);
    });
    test('Edit Discount Color',async()=>{
        await discountColor(iframe,page,newPage,widgetID);
    });
    test('Responsiveness of the preview section', async()=>{    
        await responsivePreview(iframe,page);
    });

});