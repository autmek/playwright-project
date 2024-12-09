const { expect } = require('@playwright/test');
const {
    NavigatetoApp,
    WidgetIsDisplayed,
    Savewidget,
    ReloadandWait_Newpage,
    addToCart,
    NavigateToPage,
    deleteFromCart,
} = require('./CommonFunctions');
const{
    Customise_SaveChanges,
} = require('./visualPreference');

async function CreateNewWidget(page,iframe,appName,pageName,recom_Products){
    await page.waitForLoadState('load');
    await NavigatetoApp(page,appName);
    await iframe.getByRole('button', { name: 'Create new recommendation' }).click();
    await iframe.getByText(pageName).click();
    await iframe.getByText('Cross sell').click();

    await iframe.getByRole('button',{name:"Next"}).click();
    for(const allproductRecommendation of recom_Products){
        await iframe.locator('.Polaris-TextField__Input').fill(allproductRecommendation);
        await page.waitForTimeout(1000);
        await iframe.locator('.Polaris-Checkbox').click();
        await page.waitForTimeout(1000);
   }
        
    await iframe.getByRole('button',{name:"Confirm"}).click();
    await iframe.getByRole('button',{name: 'Continue'}).click();
    await iframe.locator('.sf-widget-button').click();

    // Click on the OK button in 'Widget created' modal
    const modal = await iframe.locator('.Polaris-Modal-Dialog');
    await expect(modal).toBeVisible();
    await iframe.getByRole('button', { name: 'Okay' }).click();

}

async function deleteCrossSell(iframe,page){
    // Delete All other cross-sell products
    await page.waitForTimeout(3000);
    const deleteIcon = await iframe.locator('.sf-cs-card-content .sf-cs-column-third .Polaris-Icon');
    let deleteIcon_count = await deleteIcon.count();
    if(deleteIcon_count>0){
        while(deleteIcon_count>0){
            await deleteIcon.first().click();
            await page.waitForTimeout(500);
            await iframe.getByRole('button',{name: 'Confirm'}).click();
            await page.waitForTimeout(1000);
            deleteIcon_count = await deleteIcon.count();
        }
    }
}

async function addSpecific(iframe,page,specific,trigger,recom_Products){
        // Add new bundle
        await iframe.getByRole('button',{name: 'Add new bundle'}).first().click();
        await iframe.getByText(specific).click();
        await iframe.getByRole('button',{name:"Next"}).click();
    
        if(specific==='Specific product'||specific==='Specific collection'&&trigger){
        // Add trigger product
        await iframe.locator('.Polaris-TextField__Input').fill(trigger);
        await page.waitForTimeout(500);
        await iframe.getByLabel(trigger).locator('.Polaris-Checkbox').click();
        await page.waitForTimeout(1000);
        await iframe.locator('.sf-cs-modal-footer').getByRole('button',{name:"Next"}).click();
        }
        // Add recommendation products
        for(const Recommendation of recom_Products){
            await iframe.locator('.Polaris-TextField__Input').fill(Recommendation);
            await page.waitForTimeout(1000);
            await iframe.locator('.Polaris-Checkbox').click();
            await page.waitForTimeout(1000);
        }
    
       await iframe.getByRole('button',{name:"Confirm"}).click();
       await iframe.getByRole('button',{name: 'Continue'}).click();
   
}
async function Discount(iframe,page,en_dis,discount){
    await iframe.locator('.Polaris-Checkbox__Input').scrollIntoViewIfNeeded();
    const discountCheckbox = await iframe.locator('.Polaris-Checkbox__Input').first();
    const isDiscountChecked = await discountCheckbox.isChecked();
    if ((en_dis === 'enable' && !isDiscountChecked) ){
        await discountCheckbox.click({force:true});
        await iframe.locator('.Polaris-TextField__Input').nth(2).fill(discount);
        await page.waitForTimeout(1000);
    }else if((en_dis === 'disable' && isDiscountChecked)) 
    {
        await discountCheckbox.click({force:true});
    }
}

async function verifyDiscountonStore(newPage,widgetID,en_dis,discountValue){
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const discount_onStore = await newWidg.locator('.sf-discount-text');
    if(en_dis==='disable'){
        await expect(discount_onStore).toBeHidden();
    }else{
        await expect(discount_onStore).toBeVisible();
        await newWidg.locator('.sf-product-checkbox').first().click();
        const tot_Price = await newWidg.locator('.sf-tot-price strong').innerText();
        const original_Price = await newWidg.locator('.sf-tot-price .sf-original-price').innerText();
        const totalPrice = parseFloat(tot_Price.replace(/[^\d.]/g, ''));
        const originalPrice = parseFloat(original_Price.replace(/[^\d.]/g, ''));
        const DiscountAmount = (originalPrice - totalPrice);
        const productPrice = await newWidg.locator('.sf-product-price').first().innerText();
        const discountPrice = ((DiscountAmount/productPrice)*100);
        expect(discountPrice.toString()).toEqual(discountValue);
        return totalPrice;
    }
}

async function discountAddedtoCart(newPage,pageName,storeURL,totalPrice){
    await addToCart(newPage);
    await NavigateToPage(newPage,'Cart page',storeURL);
    if(pageName==='Cart page'){
        const cartItems = await newPage.locator('.cart-items .cart-item');
        const deleteProduct = await cartItems.filter({
            has: newPage.locator('.cart-item__name', { hasText: productOnstore })
        });
    await deleteProduct.locator('.quantity__button').first().click();
    await newPage.waitForTimeout(3000);
    }
    const tot_Price = await newPage.locator('.totals__total-value').innerText();
    const cartTotal = parseFloat(tot_Price.replace(/[^\d.]/g, ''));
    expect(cartTotal).toBe(totalPrice);
    await deleteFromCart(newPage);
    await newPage.goBack();


}
async function editverify_subtitle(page,newPage,iframe,Subtitle,widgetID){
    const subtitleBox = await iframe.locator('.Polaris-TextField__Input').nth(1);
    await subtitleBox.fill(Subtitle);
    await Savewidget(iframe,page);
    await ReloadandWait_Newpage(newPage);
    const newWidg = await WidgetIsDisplayed(newPage, widgetID);
    const discount_onStore = await newWidg.locator('.sf-discount-text').textContent();
    expect(discount_onStore).toBe(Subtitle);
}

async function discountCombo(iframe,combo){

    switch (combo){
        case 'product':
            await iframe.getByText('Other product discounts').click();
        break;
        case 'order':
            await iframe.getByText('Order discounts').click();
        break;
        case 'shipping':
            await iframe.getByText('Shipping discounts').click();
        break;
    }
}
async function desktop_displayStyle(iframe,page,newPage,widgetID,displayStyle){
    const display_style = await iframe.locator('select.Polaris-Select__Input').first();
    switch(displayStyle.toLowerCase()){
        case 'grid':
            await display_style.selectOption('cs-grid');
            break;
        case 'popup':
            await display_style.selectOption('cs-popup-desktop');
            break;
        case 'list':
            await display_style.selectOption('cs-list');
            break;
        default:
            throw new Error(`Unsupported display style: ${displayStyle}`);
    }
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);
    let newWidg  ;  
    switch(displayStyle.toLowerCase()){
        case 'grid':
            newWidg = await WidgetIsDisplayed(newPage,widgetID);
            const grid = await newWidg.locator('.sf-product-cross-sell-grid');
            await expect(grid).toBeVisible();
            break;
        case 'popup':
            await newPage.getByRole('button',{name :'Add to cart'}).click();
            newWidg = await WidgetIsDisplayed(newPage,widgetID);
            const popup = await newWidg.locator('#sf-popup-modal');
            await expect(popup).toBeVisible();
            break;
        case 'list':
            newWidg = await WidgetIsDisplayed(newPage,widgetID);
            const list = await newWidg.locator('.sf-product-cross-sell-list');
            await expect(list).toBeVisible();
            break;
    }
}
async function discountDisplay(iframe,page,newPage,widgetID,endis_able){
    const discountButton = await iframe.locator('.sf-view-heading').last();
    const arrowClass = await discountButton.locator('.sf-arrow-down');
    if(await arrowClass.count()===1){
        await discountButton.click({force:true});
    }
    const checkBox = await iframe.locator('.Polaris-Checkbox__Input').last();
    switch(endis_able.toLowerCase()){
        case 'enable':
            if(!await checkBox.isChecked()){
                await checkBox.click();
            }
            break;
        case 'disable':
            if(await checkBox.isChecked()){
                await checkBox.click();
            }
            break;
        default:
            throw new Error(`Unsupported title alignment: ${endis_able}`);
    }
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const discountText_onStore = await newWidg.locator('.sf-discount-text');
    switch(endis_able.toLowerCase()){
        case 'enable':
            await expect(discountText_onStore).toBeVisible();
            break;
        case 'disable':
            await expect(discountText_onStore).toBeHidden();
            break;
    }        

}
async function discountText(iframe,page,newPage,widgetID,edit_discountText){
    const discountButton = await iframe.locator('.sf-view-heading').last();
    const arrowClass = await discountButton.locator('.sf-arrow-down');
    if(await arrowClass.count()===1){
        await discountButton.click({force:true});
    }
    const buttonText = await iframe.locator('.Polaris-Labelled--hidden .Polaris-TextField__Input');
    await buttonText.last().fill(edit_discountText); 
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const discountText_onStore = await newWidg.locator('.sf-discount-text');
    await expect(discountText_onStore).toHaveText(edit_discountText);

}

async function discountColor(iframe,page,newPage,widgetID){
    const discountButton = await iframe.locator('.sf-view-heading').last();
    const arrowClass = await discountButton.locator('.sf-arrow-down');
    if(await arrowClass.count()===1){
        await discountButton.click({force:true});
    }
    const fontColor = await iframe.locator('.sf-mt-4 .Polaris-TextField__Input');
    await fontColor.last().fill('#ff0000'); //fontColor
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const discountText_onStore = await newWidg.locator('.sf-discount-text');
    await newPage.waitForTimeout(1000);
    await expect(discountText_onStore).toHaveCSS('color','rgb(255, 0, 0)');
}

//CartPage
async function displayStyleCart(iframe,page,newPage,widgetID,displayStyle){
    const display_style = await iframe.locator('select.Polaris-Select__Input').first();
    if(displayStyle==='grid'){
        await display_style.selectOption('cs-grid-cart');
    }else if(displayStyle==='popup'){
        await display_style.selectOption('cs-popup-desktop-cart');
    }
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);
    let newWidg;
    if(displayStyle==='grid'){
        newWidg = await WidgetIsDisplayed(newPage,widgetID);
        const grid = await newWidg.locator('.sf-cross-sell-grid');
        await expect(grid).toBeVisible();
    }else if(displayStyle==='popup'){
        await newPage.waitForTimeout(2000);
        await newPage.locator('#checkout').click();
        const popup = await newWidg.locator('#sf-popup-modal');
        await expect(popup).toBeVisible();
    }
}
async function editverify_Title(iframe,page,newPage,widgetID,newtitle){
    const titlebox = await iframe.locator('.Polaris-TextField__Input').first();
    await titlebox.fill(newtitle);
    await Savewidget(iframe,page);
    await ReloadandWait_Newpage(newPage)
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const widg_title = await newWidg.locator('.sf-widget-title').textContent();
    expect(widg_title).toBe(newtitle); 

}
async function Verify_variableToCart(newPage,widgetID,pageName,storeURL){
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    await newPage.waitForTimeout(2000);
    const productContainers = await newWidg.locator('.sf-product-item');
    let productIndex = -1;
    for (let i = 0; i < await productContainers.count(); i++) {
        const chooseOptionButton = productContainers.nth(i).locator('.sf-product-variants-dropdown');
        if (await chooseOptionButton.isVisible()) {
            productIndex = i; 
            break; 
        }
    }
    if (productIndex === -1) {
        console.log('❗ No variable products in the recommendation.');
        return;
      }
    const targetProductContainer = productContainers.nth(productIndex);
    await newPage.waitForTimeout(2000);
    const dropdown = await targetProductContainer.locator('.sf-product-variants-dropdown');
    await dropdown.click();
    await dropdown.selectOption({ index: 1 });
    const variableProduct = await targetProductContainer.locator('.sf-product-title').textContent();
    const selectedOption = await dropdown.locator('option:nth-child(2)').textContent();
    await newPage.waitForTimeout(2000);
    if(pageName==='Cart page'){
        await newWidg.locator('.sf-fbt-add-to-cart-btn').first().click();
    }else if(pageName==='Product page'){
        const selectVariable = await targetProductContainer.locator('.sf-product-checkbox');
        await selectVariable.click();   
        await addToCart(newPage); 
    }
    const urlnow = await newPage.url();
    if(! urlnow.includes('cart')){
        await NavigateToPage(newPage,'Cart page',storeURL);
    }
    const cartItem = await newPage.locator(`.cart-item__details:has-text("${variableProduct}")`);
    const cartOption = await cartItem.locator('dl .product-option dd').innerText();
    expect(cartOption).toContain(selectedOption);
    await deleteFromCart(newPage);
    await newPage.goBack();

}
module.exports = { 
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
    displayStyleCart,
    editverify_Title,
    Verify_variableToCart,
    discountAddedtoCart,
}