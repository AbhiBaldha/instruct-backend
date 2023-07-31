"use strict";
import { Request, Response } from "express";
import { responseMessage } from "../../helpers";
import { apiResponse } from "../../common";
import { chatModel, historyRoomModel, userModel } from "../../database";
// import { Configuration, OpenAIApi } from "openai";
const { Configuration, OpenAIApi } = require('openai');
const ObjectId = require("mongoose").Types.ObjectId;
import config from 'config'
// const apiKey: any = "AIzaSyCRMrLjHViF_jNSxy2noeNbJAgJfjpRjBU";
// let newKey = "85a7937f954868c27a60cdce2690f23148383d99"

const apiKey: any = config.get("apiKey");

const configuration = new Configuration({
    apiKey: apiKey
});
const openai: any = new OpenAIApi(configuration);


export const ChatWithGpt = async (req: Request, res: Response) => {
    let { user }: any = req.headers;
    try {
        let body = req.body;
        console.log('body.message :>> ', body.message);
        // let response = await openai.createChatCompletion({
        //     model: "gpt-3.5-turbo",
        //     messages: [{ role: "user", content: `${body.message}` }],
        //     // max_tokens: 50,
        // });
        // response = response.data.choices[0].message.content.trim();
        // let response = "Sure! Here is an example of how to use the `<input>` tag in React \n .React.React.React.React.React./mReact.\njs:\n\n```javascript\nimport React, { useState } from 'react';\n\nfunction App() {\n  const [inputValue, setInputValue] = useState('');\n\n  const handleChange = (e) => {\n    setInputValue(e.target.value);\n  };\n\n  return (\n    <div>\n      <input type=\"text\" value={inputValue} onChange={handleChange} />\n      <p>You entered: {inputValue}</p>\n    </div>\n  );\n}\n\nexport default App;\n```\n\nIn the above code, we first import the necessary dependencies from React. The `useState` hook is used to create a state variable called `inputValue` and a function called `setInputValue` to update it. \n\nInside the `App` component, we render an `<input>` tag with `type=\"text\"`. The value of the input is set to `inputValue` and `onChange` event is attached to the input. The `onChange` event handler, `handleChange`, updates the `inputValue` state whenever the user types into the input.\n\nFinally, we display the input value using the `inputValue` variable inside a `<p>` tag."
        let response = "To print \"hello world\" in Python:\n```python\nprint(\"hello world\")\n```\n\nTo print \"hello world\" in JavaScript:\n```javascript\nconsole.log(\"hello world\")\n```\n\nTo print \"hello world\" in Java:\n```java\npublic class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println(\"hello world\");\n    }\n}\n```\nExplanation:\n- In Python, we use the built-in `print()` function to output the message `\"hello world\"`.\n- In JavaScript, we use the `console.log()` function to print the message `\"hello world\"` to the console.\n- In Java, we create a class called `HelloWorld` with a `main` method. Inside the `main` method, we use `System.out.println()` to print the message `\"hello world\"` to the console."
        // let response = "yes mithil is lodo "
        console.log('response---ChatGpt :>> ', response);
        if (response) {
            if (body.isFirstTime === true) {
                console.log("true");
                let data = await new chatModel({
                    question: body.message,
                    answer: response,
                    userId: user._id,
                }).save();
                console.log('data :>> ', data._id);
                let title: any = body.message.split(' ').slice(0, 4).join(' ')
                let historyRoom = await new historyRoomModel({
                    title: title,
                    chatIds: ObjectId(data._id),
                    userId: ObjectId(user._id)
                }).save()
                console.log('historyRoom :>> ', historyRoom);
                return res.status(200).send(await apiResponse(200, responseMessage?.getDataSuccess("Response"), { response, historyRoom }, {}));
            } else {
                if (!body.historyRoomId) return res.status(404).json(await apiResponse(404, "plz enter historyRoomId is required!!", null, {}));
                let data1: any = await historyRoomModel.findOne({ _id: ObjectId(body?.historyRoomId), isActive: true })
                if (!data1) return res.status(403).json(await apiResponse(403, "historyRoomId is not isexit in db !", null, {}));
                console.log("false");
                let data = await new chatModel({
                    question: body.message,
                    answer: response,
                    userId: ObjectId(user._id),
                }).save();
                let historyRoom = await historyRoomModel.findOneAndUpdate({ _id: ObjectId(body.historyRoomId), userId: ObjectId(user._id), isActive: true }, { $push: { chatIds: ObjectId(data._id) } }, { new: true })
                console.log('data :>> ', data);
                console.log('historyRoom :>> ', historyRoom);
                return res.status(200).send(await apiResponse(200, responseMessage?.getDataSuccess("Response"), response, {}));
            }
        } else {
            return res.status(404).json(await apiResponse(404, responseMessage?.getDataNotFound("Response"), null, {}));
        }
    } catch (error) {
        console.log("error", error);
        return res.status(500).json(await apiResponse(500, responseMessage?.internalServerError, null, {}));
    }
};

export const update_chat_by_id = async (req: Request, res: Response) => {
    let { user }: any = req.headers;
    let { chatId, message }: any = req.body
    try {
        // let response = await openai.createChatCompletion({
        //     model: "gpt-3.5-turbo",
        //     messages: [{ role: "user", content: `${message}` }],
        //     max_tokens: 50,
        // });

        // response = response.data.choices[0].message.content.trim();
        let response: any = "Jay Shree Ram is a popular Hindu mantra that is used as a greeting or an expression of devotion to Lord Ram, who is considered an incarnation of Lord Vishnu. It is often chanted or recited by followers of Hinduism as a way"
        console.log('response---ChatGpt :>> ', response);
        if (response) {
            let data = await chatModel.findByIdAndUpdate({ _id: chatId, userId: ObjectId(user._id), isActive: true }, { question: message, answer: response }, { new: true })
            console.log('data :>> ', data);
            return res.status(200).send(await apiResponse(200, responseMessage?.updateDataSuccess("Response"), response, {}));
        } else {
            return res.status(404).json(await apiResponse(404, responseMessage?.updateDataError("Response"), null, {}));
        }
    } catch (error) {
        console.log("error", error);
        return res.status(500).json(await apiResponse(500, responseMessage?.internalServerError, null, {}));
    }
}