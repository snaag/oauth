const login = document.querySelector(".login");
const selectDate = document.querySelector(".select-date button");
const randomDate = document.querySelector(".select-date input");
const selectSchedule = document.querySelector(".schedule button");
const scheduleText = document.querySelector(".schedule input");
const save = document.querySelector(".save button");

const client_id = "";
const scopeList = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.addons.execute",
];
const scope = scopeList.join(" ");

function init() {
    gapi.load("auth2", onLoad);
    function onLoad() {
        console.log("onLoad called");
        /* Ready. Make a call to gapi.auth2.init or some other API */
    }
}

function initUserInfo() {
    if (gauth.isSignedIn.get()) {
        console.log("logined");
        var profile = gauth.currentUser.get().getBasicProfile();
        console.log("profile", profile);
    } else {
        console.log("not logined");
    }
}

function handleButtonText(newText) {
    login.innerHTML = newText;
}

login.addEventListener("click", () => {
    gapi.auth2.authorize(
        {
            client_id,
            scope,
            response_type: "id_token permission",
        },
        (res) => {
            if (res.error) {
                console.log("ERROR");
                return;
            }

            const accessToken = res.access_token;
            const idToken = res.id_token;
            window.accessToken = accessToken;
            window.idToken = idToken;
            const vh100 = document.documentElement.clientHeight;
            window.scrollTo(0, vh100);
        }
    );
});

const handleSave = async () => {
    try {
        const calendarId = await getFirstCalendarId();
        postSchedule(calendarId, window.randomDate, window.scheduleText);
        window.alert("성공적으로 저장되었습니다!");
    } catch (error) {
        window.alert("문제가 발생했습니다.");
        console.log(error);
    }
};

const getFirstCalendarId = async () => {
    const result = await axios({
        method: "get",
        url: "https://www.googleapis.com/calendar/v3/users/me/calendarList",
        headers: {
            Authorization: "Bearer " + window.accessToken,
        },
    });
    console.log("list", result);
    return result?.data?.items[0]?.id;
};

const postSchedule = async (calendarId, text = "schedule title", date) => {
    const result = await axios.post(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        {
            start: {
                date,
            },
            end: {
                date,
            },
            summary: text,
        },
        {
            headers: {
                Authorization: "Bearer " + window.accessToken,
            },
        }
    );
    console.log(result);
};

const generateDate = (year) => {
    return (month) => {
        return (day) => {
            return [year, month, day].join("-");
        };
    };
};

const generate202109dd = generateDate("2021")("09");

selectDate.addEventListener("click", () => {
    console.dir(randomDate);
    const date = generate202109dd(getRandomInt(10, 20));
    randomDate.value = date;
    window.randomDate = date;
});

selectSchedule.addEventListener("click", () => {
    window.scheduleText = scheduleText.value;
});

save.addEventListener("click", () => {
    handleSave();
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}
