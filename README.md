## ✨ Magic Link

### 该页面的 [**简体中文版本**](https://blog.muna.uk/archives/shortUrl-vercel.html)

Serverless URL shortening service based on Nodejs and Express.
You can deploy the project using Vercel, Netlify, or other Serverless services, and for Vercel and Netlify, it's completely free.

> This document was originally a supporting Chinese document for the old version of ShortUrl, now it has been modified to be used as a document for Magic-Link, and the old version of the Shortlink project will no longer provide updates except for security updates.
> The database structure of the old version is currently not applicable to the new version of ShortUrl, the conversion tool of the old and new database structure will be available soon.


## 🎉 Features

- No server
- Automatically prevents generation of duplicate short URLs
- Background administration page
  - Add Short URL
  - Short URL List
  - Delete Short URLs
  - Customize URL
- Fast access to third-party authentication systems
- API
  - Can be used for secondary development
- Database Cache


## 😎Demo

Test link: https://go.muna.uk/eXw8n

<img width="1080" alt="login" src="https://github.com/lilac-milena/Magic-Link/assets/143427814/636fd64f-ea89-469f-8948-b3dd0e75670e">

## 📃 API Documentation
[*API-documentation.md*](API-documentation.md)

## 😜 Deployment

### Part 1

> Claiming the Mongodb database
> Video version: [Youtube Part1](https://youtube.com/watch?v=wH-Hcnl9bg8&si=EnSIkaIECMiOmarE)
> Since the short link service needs to store URL data, you need to request a free Mongodb database from Mongodb.com for data storage.

In this section, you will get a Mongodb url, please save it and we will use it in the next section.

Open https://account.mongodb.com/account/register to register an account
<img width="914" alt="image" src="https://object.muna.uk/imgs/posts/vercel-shortUrl/213992084-84a13904-06c1-458f-a662-543999bf8698.png">
<img width="914" alt="image" src="https://object.muna.uk/imgs/posts/vercel-shortUrl/213992242-673cec96-9f27-414e-ba04-929614ac9213.png">
<img width="914" alt="image" src="https://object.muna.uk/imgs/posts/vercel-shortUrl/213992292-b2e4df09-3b99-4197-9be7-a6642f784805.png">
<img width="909" alt="image" src="https://object.muna.uk/imgs/posts/vercel-shortUrl/213992322-038f8ea1-cf12-4595-9a22-4cd2fd8be36a.png">

Create a database account and record the account password

<img width="906" alt="image" src="https://object.muna.uk/imgs/posts/vercel-shortUrl/213992401-2f597f50-b9bb-4b89-bd99-edf2f6facc74.png">

Authorize all IP connections

<img width="915" alt="image" src="https://object.muna.uk/imgs/posts/vercel-shortUrl/213992557-604169c6-207f-4795-a9a2-3e1b28a77243.png">

Create

<img width="129" alt="image" src="https://object.muna.uk/imgs/posts/vercel-shortUrl/213992674-4283b9f6-ce40-4bd3-9d41-5a0fc1c980da.png">
<img width="904" alt="image" src="https://object.muna.uk/imgs/posts/vercel-shortUrl/213992717-2bbd5525-875b-4344-9e67-dc8ee2670b74.png">

Click this option

<img width="853" alt="image" src="https://object.muna.uk/imgs/posts/vercel-shortUrl/213992778-8ac478f8-0fbe-4e5a-a416-9afd018d8db4.png">

Copy the link URL

<img width="539" alt="image" src="https://object.muna.uk/imgs/posts/vercel-shortUrl/213992829-ba6b8728-f7b7-4721-809f-c6cb0d12506a.png">

Replace "< password >" in the URL with the password you just set.

<img width="584" alt="image" src="https://object.muna.uk/imgs/posts/vercel-shortUrl/213992971-87292770-b0c9-47d1-b807-b23c79528a54.png">

***

### Part 2

#### 1. Deploy the repository to Vercel:

> You need to click the button below to go to the Vercel deployment page

[![Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lilac-milena/Magic-Link/)

If you have not logged in or registered with Vercel, please follow the page to register/log in and then click the Deploy button above again.

If everything is ready, you will see the following page after clicking the button:

<img width="1003" alt="image" src="https://object.muna.uk/imgs/posts/vercel-shortUrl/213967437-dc480bfe-32a5-4989-920f-a40390f56cda.png">

You need to give your project a name and fill in the "Repository Name" input box, click the "Create" button.

<img width="981" alt="image" src="https://object.muna.uk/imgs/posts/vercel-shortUrl/213967720-2f9c9051-ccf6-449a-af15-ba662ff5d0d8.png">

At this point Vercel will automatically create a repository with the same name in your Github and pull the code for the project.

<img width="989" alt="image" src="https://object.muna.uk/imgs/posts/vercel-shortUrl/213967788-07be714c-ea3a-4a8d-9d5b-e1bd95f0f348.png">

Once the pull is complete, Vercel will start the project deployment, which is also automated.

<img width="951" alt="image" src="https://object.muna.uk/imgs/posts/vercel-shortUrl/213967842-b9861645-61db-4427-bde7-0274a7fe367c.png">

When you see this page, the project has been successfully deployed.

<img width="979" alt="image" src="https://object.muna.uk/imgs/posts/vercel-shortUrl/213971819-93386058-d0bc-46e7-8171-f7cf470944e5.png">

#### 2.Add Environment Variables

Once the deployment is complete, you need to click the "Continue to Dashboard" button located in the upper right corner of the page.

<img width="181" alt="image" src="https://object.muna.uk/imgs/posts/vercel-shortUrl/213968419-e6a978aa-59fe-4281-8608-2e62e8ac7c27.png">

> If you accidentally close this page, you can simply open the program on the home page.
> On the new page, click the "Settings" button in the menu bar.


Click the "Environment Variables" button to open the Environment Variables Settings page.

![image](https://object.muna.uk/imgs/posts/vercel-shortUrl/213968655-58662c1c-1358-4e91-add1-91503850f7da.png) 

On the Environment Variable Settings screen, create a new environment variable according to the table below:

|  Variable name  |  Value  |  Example |
|---|---|---|
|  linkLen  |  An integer, optional, defaults to 8, is the length of the random string used to generate the short link  | 10 |
|  mongodbCollection  |  optional, Database Collection Database tables used to distinguish between different services (created automatically if they don't exist)  | Link |
|  mongodbDB  |  optional, database name (will be created automatically if it does not exist)  | MyService1 |
|  AdminSession  |  The key used to log into the shortlink management page and request APIs.  | 123456 |
|  mongodbUrl  |  mongodbUrl, In the previous section get  | mongodb+srv://xxx:xxx |


Check that the "Production", "Preview" and "Development" options below are all selected.

Finally, click the "Save" button to save.

![image](https://object.muna.uk/imgs/posts/vercel-shortUrl/213969111-5d3c5de2-9e4d-4edf-b29a-a55410788c4f.png) 

We need to click on the "Deployments" button in the navigation bar to open the Deployments tab.

![image](https://object.muna.uk/imgs/posts/vercel-shortUrl/213969434-70111d0f-0734-4559-9bf0-fe8af571e154.png) 

Click the "..." button to the right of the first record. button to the right of the first record to redeploy the project. 

![image](https://object.muna.uk/imgs/posts/vercel-shortUrl/213969594-cdc1025e-98b3-46f9-97bc-902ef0c1e145.png) 

Click the "REDEPLOY" button to redeploy.

 ![image](https://object.muna.uk/imgs/posts/vercel-shortUrl/213969744-7bb050a6-4662-4782-8579-696367ef8482.png) 

When you see this page, the service has been successfully deployed

 ![image](https://object.muna.uk/imgs/posts/vercel-shortUrl/213972652-a51b54f9-04ae-4a8d-9b2c-04f3deb52d7f.png) 

You can access the administration page through the domain name + /admin/ (**admin must be followed by the / sign **), the login password is the value of "AdminSession" in the environment variable you set.

![image](https://github.com/lilac-milena/Magic-Link/assets/143427814/d19a0da2-0999-4c93-8dac-eceba7f249cd)


If you need to customize your domain name, you can bind it yourself on the setup page.
