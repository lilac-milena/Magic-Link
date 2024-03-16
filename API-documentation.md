# Magic Link API Documentation
> 🌏 [Simplified Chinese translation of this document](API-documentation.zh.md)

> ❗ Please make sure that the version of Magic Link you are deploying is after this [Commit](https://github.com/lilac-milena/Magic-Link/commit/cac2f3f4ba45b987cf8952ea405d9764c66b4c39), Only code after this release adapts to the new version of authentication described in this document.

> 👀 Magic Link provides developers with three API interfaces, Add, Check and Delete, to help developers quickly integrate Magic Link into other applications.  
> All API requests for Magic Link are made via "GET", this document will guide you to concatenate the API URIs according to you.  

## [Important] Authentication part
Magic Link Like most applications, the authentication parameters for the API are passed in the request header:
|  Parameter name   | Note |
|  ----  | ----  |
| type  | The authentication method, for general users, should be filled in with "session" |
| session  | Authentication Key (Session) |

> ❓ The reason why Magic-Link introduced the "type" parameter is to make it easier for developers to access third-party authentication systems on their own.

Example Request Header:
```
type: session
session: YourSession
```

## Create:
### Summary
Host: /admin/api/create  
Method: GET  
Request Header: Please attach an authentication request header   
GET parameter:  
|  Parameter name  | Friendly Name | Note |
|  ----  | ----  | ----  |
| to  | Long link (link to be converted) | 1. Must begin with http:// https:// mailto:// or ftp://, 2. **To be converted to Base64 encoding**  |
| path  | Short link (converted link) Path | **Can be empty**, need to start with a forward slash (/), leave it blank will be generated randomly (will ensure that it does not conflict with existing paths), such as (do not leave it blank) the specified path already exists, it will not continue to new. |

### Example cURL：
``` bash
curl --location 'https://example.com/admin/api/create?to=aHR0cHM6Ly9nb29nbGUuY29tLw%3D%3D' \
--header 'type: session' \
--header 'session: YourSession'
```

## Delete
### Summary
Host: /admin/api/delete  
Method: GET  
Request Header: Please attach an authentication request header   
GET parameter:  
|  Parameter name  | Friendly Name | Note |
|  ----  | ----  | ----  |
| path | Link('s path) to be deleted | **Beginning with a forward slash (/)** |

### Example cURL:
``` bash
curl --location 'https://example.com/admin/api/delete?path=%2Fpath' \
--header 'type: session' \
--header 'session: YourSession'
``` 

## Search
### Summary
Host：/admin/api/getLinkList  
Method: GET  
Request Header: Please attach an authentication request header   
GET parameter:  
|  Parameter name  | Friendly Name | Note |
|  ----  | ----  | ----  |
| page | Query Page | **"0" is the initial number of pages** |
| pageSize | Number of single pages |  |
| other | Query filter parameters | **Can be empty**, using basic *Mongodb query syntax*, see below for usage details |

### Example cURL
``` bash
curl --location 'https://example.com/admin/api/getLinkList?page=0&pageSize=20' \
--header 'type: session' \
--header 'session: YourSession'
```

### How to use query filter parameters:
The query filter parameter is a JSON field that is used to qualify the query when querying a Mongodb database:, here are a few examples:  
``` JSON
// Find link(s) to https://google.com/
{
    "to":"https://google.com/"
}
```
``` JSON
// Find link(s) with path /google
{
    "path":"/google"
}
```
``` JSON
// Find link(s) created by admin
// The misspelling of the creater field in this query example is a legacy issue and has not been changed due to cross-version compatibility of the database structure.
{
    "creater":"admin"
}
```