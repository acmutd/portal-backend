
export default class ErrorService {
    static generatePostError<T>(reqObj: any, exampleObj: T) {
        let response = {error: { message: "You are missing the " }}
        let missing: string[] = []
        let wrongType: ({key: string, type: string, correct: string})[] = []
        for(const key in exampleObj) {
            if(Object.keys(reqObj).includes(key)) {
                if(typeof exampleObj[key] !== typeof reqObj[key])
                    wrongType.push({key, type: typeof reqObj[key], correct: typeof exampleObj[key]})
            } else missing.push(key);
        }
        if(missing.length == 0) return null

        missing.forEach((key, index) => {
            response.error.message += index+1 != missing.length ? `'${key}', ` : `and '${key}' key(s).`})
        
        wrongType.forEach(el => response.error.message += ` You gave the '${el.key}' key a '${el.type}' type, when it should be a '${el.correct}' type.`)

        return response;
    }
}