// Replace imageSrc values with your final poster image paths.
// Example: imageSrc: "assets/posters/class-2-poster.png"
const activityUrl = "https://script.google.com/macros/s/AKfycbwvvqpjxUDxk86gbdVjh8EVd_rA_RMzSHn1DR6YJNtaRuNo6Plf6EQV2a5accizl7U/exec";

const posters = [
  {
    id: "class-1",
    classNumber: 1,
    title: "1학년 1반 포스터",
    imageSrc: "assets/posters/class-1-poster.png",
    imageAlt: "1학년 1반 영화 포스터",
    copy: "“들리지 않아도 들리는 것처럼 이어진 이야기”",
    mainScene: "보리와 아빠가 마주 앉아 마음으로 소통하는 장면",
    description: "하늘빛 배경과 따뜻한 인물 구도를 통해, 말하지 않아도 서로에게 닿는 마음을 중심에 둔 포스터입니다.",
    intention: "1반은 보리와 아빠가 서로를 바라보는 장면에 담긴 소통의 온기에 주목했습니다. 넓은 하늘과 부드러운 빛을 배경으로 배치해, 소리보다 마음이 먼저 전해지는 영화의 정서를 표현했습니다.",
    quotePreview: "“마음으로 소통하는 따뜻한 영화”",
    relatedReviews: [
      "마음으로 소통하는 따뜻한 영화",
      "말하지 않아도 전할 수 있다",
      "‘하늘보리’보다 주인공 ‘보리’가 더 좋아졌다"
    ]
  },
  {
    id: "class-2",
    classNumber: 2,
    title: "1학년 2반 포스터",
    imageSrc: "assets/posters/class-2-poster.png",
    imageAlt: "1학년 2반 영화 포스터",
    copy: "다르게 들리는 세상 속에서 서로를 이해하는 법",
    mainScene: "소리와 침묵 사이에서 마음을 나누는 장면",
    description: "서로 다른 방식으로 세상을 받아들이는 인물들을 대비시키며, 이해가 시작되는 순간을 중심에 둔 포스터입니다.",
    intention: "2반은 영화가 보여 주는 소통의 방식을 중심으로 포스터를 기획했습니다. 손짓, 시선, 표정처럼 작은 표현들이 모여 마음을 전한다는 점을 살리기 위해 부드러운 회청색과 필름 프레임을 사용했습니다.",
    quotePreview: "“듣는다는 것은 소리만이 아니라 마음을 보는 일이라는 생각이 들었다.”",
    relatedReviews: [
      "조용한 영화였지만 마음속에서는 많은 말이 오갔다.",
      "서로를 이해하려는 장면들이 가장 따뜻하게 느껴졌다."
    ]
  },
  {
    id: "class-3",
    classNumber: 3,
    title: "1학년 3반 포스터",
    imageSrc: "",
    imageAlt: "1학년 3반 영화 포스터",
    copy: "보리가 다시 마주한 가족, 그리고 자기 자신의 목소리",
    mainScene: "보리가 자신의 진심을 마주하는 장면",
    description: "성장 영화의 흐름을 살려, 보리가 자신의 마음을 받아들이는 순간을 밝은 여백과 손글씨 문장으로 표현한 포스터입니다.",
    intention: "3반은 영화 속 보리가 겪는 변화에 집중했습니다. 포스터의 여백은 보리가 앞으로 채워 갈 시간을 뜻하며, 따뜻한 베이지와 하늘색은 성장의 아픔과 희망을 함께 나타냅니다.",
    quotePreview: "“보리가 달라진 것이 아니라, 자기 마음을 더 잘 알게 된 것 같다.”",
    relatedReviews: [
      "보리가 자기 마음을 알아 가는 과정이 가장 인상 깊었다.",
      "마지막에는 보리를 응원하고 싶은 마음이 들었다."
    ]
  }
];

// Add, remove, or edit review cards here. The classNumber controls the class filter.
const reviews = [
  {
    "id": "r-001",
    "classNumber": 1,
    "rating": 4.5,
    "text": "들리지않아도 들리는것 같이 이어진 이야기",
    "scene": "보리가 거실에서 은정이에게 들린다는 사실을 말하는 장면"
  },
  {
    "id": "r-002",
    "classNumber": 1,
    "rating": 4.5,
    "text": "마음으로 소통하는 따뜻한 영화",
    "scene": "보리가 정우가 수술을 하면 축구를 못하게 된다고 울면서 말하는 장면"
  },
  {
    "id": "r-003",
    "classNumber": 1,
    "rating": 4.5,
    "text": "소리를 듣든 못 듣든 우리 똑같다.",
    "scene": "정우가 풋살 경기장에서 은메달을 얻었을 때의 장면"
  },
  {
    "id": "r-004",
    "classNumber": 1,
    "rating": 3.5,
    "text": "가족들의 사랑",
    "scene": "엄마와 보리가 평상에 누어서 얘기를 나누다가 보리가 엄마한테 내가 귀가 안들려도 괜찮냐고 물어봤을때 엄마가 들리든 안들리든 똑같이 사랑한다고한 장면"
  },
  {
    "id": "r-005",
    "classNumber": 1,
    "rating": 3.5,
    "text": "나는 보리 딱 3번 까지볼것 갔다.",
    "scene": "정우가 골은 못 넣지만 그래도 활약해 학교에서 친구들이 축하해 주었다."
  },
  {
    "id": "r-006",
    "classNumber": 1,
    "rating": 4.5,
    "text": "많은 생각을 할 수 있는 영화",
    "scene": "보리가 바다에 빠져드는 장면"
  },
  {
    "id": "r-007",
    "classNumber": 1,
    "rating": 4,
    "text": "청각장애인과 함께 사는 사람의 시점과 청각장애인의 시점을 표현하여 서로의 시점,마음을 이해하도록 한것이 놀라웠다",
    "scene": "가족들이 마당에 앉아 함께 피자를 먹는장면"
  },
  {
    "id": "r-008",
    "classNumber": 1,
    "rating": 2.5,
    "text": "교훈을 주면서도 너무 무겁거나 지루한 분위기가 되지않는 좋은 영화",
    "scene": "보리와 아빠가 낚시하는 장면"
  },
  {
    "id": "r-009",
    "classNumber": 1,
    "rating": 2.5,
    "text": "이 영화를 보고난 후 ’하늘보리’ 보단 주인공 ’보리’가 더 좋아졌다.",
    "scene": "아침 먹을 때 보리 빼고 가족들끼리 수어로 대화하는 장면"
  },
  {
    "id": "r-010",
    "classNumber": 1,
    "rating": 4,
    "text": "달라도 이어져있다는 사실을 깨닫게 해주는 영화",
    "scene": "아름드리나무 아래에서 은정이와 이야기를 나누는 장면"
  },
  {
    "id": "r-011",
    "classNumber": 1,
    "rating": 3,
    "text": "들리지는 않아도 함께하는 모습이 인상깊었다",
    "scene": "보리와 은정이가 나무아래에서 앉아서 보리가 자신의 속마음을 은정이에게 말하는 장면"
  },
  {
    "id": "r-012",
    "classNumber": 1,
    "rating": 4.5,
    "text": "가족을 따뜻한 사랑을 녹여낸 영화",
    "scene": "단오장에서 가족을 찾다가 불꽃놀이가 시작될때 소원을 비는 장면"
  },
  {
    "id": "r-013",
    "classNumber": 1,
    "rating": 2,
    "text": "보리가 단오장에서 길을 잃어버리고 경찰서에서 짜장면을 먹고 부모님과 만나고 소원으로 소리를 잃고 싶다고 빌고 바다에 들어간후 일시적으로 소리를 잃고 그 사실을 숨기고 그 사실을 말하고는 정우의 축구대결을 구겨한다",
    "scene": "물고기를 잡는모습"
  },
  {
    "id": "r-014",
    "classNumber": 1,
    "rating": 4,
    "text": "귀가 안들려서 소통을 못하는게 아쉬웠다",
    "scene": "정우가 친구들이 모두 수어를 사용했으면 좋겠다고 말하는 장면"
  },
  {
    "id": "r-015",
    "classNumber": 1,
    "rating": 3.5,
    "text": "보리가 가족중에서 나만 다르다는 소외감을 느끼고 소리가 없어지고 싶다는 소원을 가지고 성장하는 영화",
    "scene": "보리가 바다에 뛰어드는 장면"
  },
  {
    "id": "r-016",
    "classNumber": 1,
    "rating": 4.5,
    "text": "혼자가 아니라는 것을 깨달을 수 있게 해준다☺️",
    "scene": "보리와 아빠, 은정이와 은정이 아빠가 정우의 경기를 보는 장면"
  },
  {
    "id": "r-017",
    "classNumber": 1,
    "rating": 4.5,
    "text": "소리를 못들어도 우리는 하나다.",
    "scene": "보리가 바다에 나자르본주를 던질 때의 장면"
  },
  {
    "id": "r-018",
    "classNumber": 1,
    "rating": 4.5,
    "text": "외롭지만 점점 따뜻해지고 가족의 의미를 알려주는 영화",
    "scene": "가족이 아침을 먹는 장면"
  },
  {
    "id": "r-019",
    "classNumber": 1,
    "rating": 4,
    "text": "청각장애인과 함께 사는 사람의 시점과 청각장애인의 시점,",
    "scene": "가족들이 마당에 앉아 함께 피자를 먹는장면"
  },
  {
    "id": "r-020",
    "classNumber": 1,
    "rating": 4.5,
    "text": "말하지 않아도 전할 수 있다.",
    "scene": "아빠가 수어로 '들리든 안 들리든 우리는 똑같아'라고 하는 장면."
  },
  {
    "id": "r-021",
    "classNumber": 1,
    "rating": 1,
    "text": "자신의 고민을 해결하는 보리",
    "scene": "물고기 잡는장면"
  },
  {
    "id": "r-022",
    "classNumber": 1,
    "rating": 3.5,
    "text": "착각을 읽은 가족중 나만 정사",
    "scene": "폭죽이 터지는 모습"
  },
  {
    "id": "r-023",
    "classNumber": 3,
    "rating": 2.5,
    "text": "듣지 못하는 사람들도 행복하다",
    "scene": "짜장면 먹을때"
  },
  {
    "id": "r-024",
    "classNumber": 3,
    "rating": 5,
    "text": "귀가 들리든 안들리든 가족은 영원하다.",
    "scene": "보리가 나자르 본주를 버리는 모습"
  },
  {
    "id": "r-025",
    "classNumber": 3,
    "rating": 2.5,
    "text": "듣지 못하는 사람들도 행복하다",
    "scene": "보리가 계획범이 되어 일부러 바다에 빠지고 안들리는 척하는 빌런이 됐을때"
  },
  {
    "id": "r-026",
    "classNumber": 3,
    "rating": 4.5,
    "text": "사람은 소통으로 살아야 한다",
    "scene": "바다에 빠지면 안 들린다는 말을 듣고 자발적으로 바다에 빠지는 장면"
  },
  {
    "id": "r-027",
    "classNumber": 3,
    "rating": 3.5,
    "text": "부모는 어떤 상황이닥쳐도 자식을 아낀다.",
    "scene": "낚시를 하는 아빠를 찾아가 우리는 똑같다고 하는장면"
  },
  {
    "id": "r-028",
    "classNumber": 3,
    "rating": 5,
    "text": "장애인들도 행복하다는걸 보여준 영화",
    "scene": "불꽃놀이에서 불꽃이 터지는 장면"
  },
  {
    "id": "r-029",
    "classNumber": 3,
    "rating": 4,
    "text": "가족을 위해서라면 아낌없이 줄수 있는 자의 멋진 이야기.",
    "scene": "바다에 몸을 던지는 장면"
  },
  {
    "id": "r-030",
    "classNumber": 3,
    "rating": 4.5,
    "text": "우리는 모두 똑같다",
    "scene": "평상에서 피자를 먹는 장면"
  },
  {
    "id": "r-031",
    "classNumber": 3,
    "rating": 2,
    "text": "“말하지 않아도 알아요”",
    "scene": "보리와 아버지가 함께 낚시를 하며 수어로 대화하는 장면"
  },
  {
    "id": "r-032",
    "classNumber": 3,
    "rating": 4,
    "text": "눈빛으로도 마음을 줄수 있는 영화이다",
    "scene": "보리와 아빠가 같이 낚시를 하면서 수어로 대화 하는 장면이 생각난다"
  },
  {
    "id": "r-033",
    "classNumber": 3,
    "rating": 5,
    "text": "가까이 볼 수 있는 가족에 따뜻한 온기를 담은 영화.",
    "scene": "낚시터에서 아빠가 보리에게 ‘들리든 안 들리든 우린 다 똑같다’고 말 하는 장면"
  },
  {
    "id": "r-034",
    "classNumber": 3,
    "rating": 4,
    "text": "그들의 세계는 험난하고도 행복했다.",
    "scene": "보리와 아빠가 함께 낚시하며 즐겁게 대화하는 장면"
  },
  {
    "id": "r-035",
    "classNumber": 3,
    "rating": 4.5,
    "text": "겪은적은 없지만 겪은 일 처럼 느껴지는 영화.",
    "scene": "보리가 안 들리는 척 하다가 가족들에게 들린다고 외치면서 우는 장면."
  },
  {
    "id": "r-036",
    "classNumber": 3,
    "rating": 2,
    "text": "말하지 않아도 알아요",
    "scene": "보리와 아버지가 함께 낚시를 하며 수어로 대화하는 장면"
  },
  {
    "id": "r-037",
    "classNumber": 3,
    "rating": 3,
    "text": "들리지 않도 사랑이그대로 느껴지는 이야기.",
    "scene": "보리가 귀가 안들리는연기를하다 정우의 수술을막기위해 진실을 말한 장면"
  },
  {
    "id": "r-038",
    "classNumber": 3,
    "rating": 5,
    "text": "사람은 이루기 위해 뭐든 한다",
    "scene": "보리가 서낭당에서 소원을 비는 장면"
  },
  {
    "id": "r-039",
    "classNumber": 3,
    "rating": 2.5,
    "text": "🙋‍♀️🗣️❌🗣️👍😅",
    "scene": "🌊💦💧💦💦🏃‍♀️"
  },
  {
    "id": "r-040",
    "classNumber": 3,
    "rating": 5,
    "text": "말을 못해도 행복하게 사는게 그게 진짜 행복이라 생각한다",
    "scene": "보리가 들린다고 가족들에게 알리는 장면."
  },
  {
    "id": "r-041",
    "classNumber": 2,
    "rating": 5,
    "text": "모두다 똑같아",
    "scene": "정우가 축구대회에 나간 장면."
  },
  {
    "id": "r-042",
    "classNumber": 2,
    "rating": 5,
    "text": "있는 존재만으로 사랑하자",
    "scene": "정우가 혼자서 축구 연습을 하는 모습"
  },
  {
    "id": "r-043",
    "classNumber": 2,
    "rating": 4.5,
    "text": "말을 못한다는 이유만으로 차별 하면 안된다.",
    "scene": "정우가 승부치기를 하는 장면"
  },
  {
    "id": "r-044",
    "classNumber": 2,
    "rating": 5,
    "text": "너무 감동적인데 코믹으로해서 지루하지가않다",
    "scene": "정우가짜장라면을 먹는장면"
  },
  {
    "id": "r-045",
    "classNumber": 2,
    "rating": 4,
    "text": "말을 하지 못해도 가족의 사랑을 느낄 수 있다",
    "scene": "경찰서에서 짜장면 먹은것"
  },
  {
    "id": "r-046",
    "classNumber": 2,
    "rating": 5,
    "text": "되게 잔잔하고 마음이 편해지는 그런 영화",
    "scene": "불꽃놀이가 터지고 나서 엄마아빠를 찾은 장면"
  },
  {
    "id": "r-047",
    "classNumber": 2,
    "rating": 5,
    "text": "눈빛만으로도 소통을 할 수 있는 가족",
    "scene": "보리가 안들리다가 들리는걸 말했을때"
  },
  {
    "id": "r-048",
    "classNumber": 2,
    "rating": 3.5,
    "text": "소통의 의미를 감동적으로 알려주는 영화",
    "scene": "단오장에 가서 보리가 가족들을 잃어버려 큰 불꽃이 필때 소원비는 장면"
  },
  {
    "id": "r-049",
    "classNumber": 2,
    "rating": 5,
    "text": "우리는 가족이 다른 가족들 보다 행복해.",
    "scene": "가족들이랑 다같이 불꽃놀이에 간 장면"
  },
  {
    "id": "r-050",
    "classNumber": 2,
    "rating": 4.5,
    "text": "인생에서 가족이 가장 소중하다는걸 다시 알수있다",
    "scene": "경찰서에서 짜장면을 먹는 장면"
  },
  {
    "id": "r-051",
    "classNumber": 2,
    "rating": 4.5,
    "text": "가족의 사랑을 알려주는영화",
    "scene": "보리 들리는거 밝히는씬"
  },
  {
    "id": "r-052",
    "classNumber": 2,
    "rating": 4.5,
    "text": "소리는 들려도 안들려도 행복하다.",
    "scene": "보리가 나보르 본주를 바다에 버리는 장면"
  },
  {
    "id": "r-053",
    "classNumber": 2,
    "rating": 5,
    "text": "편견이 없는 영화",
    "scene": "은정이가 보리의 고민을 들어주는 장면"
  },
  {
    "id": "r-054",
    "classNumber": 2,
    "rating": 5,
    "text": "되게 잔잔하고 마음이 편해지는 그런 영화",
    "scene": "옷가게에서 사기 친 장면"
  },
  {
    "id": "r-055",
    "classNumber": 2,
    "rating": 5,
    "text": "편견이 없는 영화",
    "scene": "은정이가 보리의 고민을 들어주는 장면"
  },
  {
    "id": "r-056",
    "classNumber": 2,
    "rating": 2.5,
    "text": "말소리는 없어도 서로의 모든것을 알수있는 사이",
    "scene": "보리와 은정이가 아름드리나무 밑에서 대화하는 장면"
  },
  {
    "id": "r-057",
    "classNumber": 2,
    "rating": 3.5,
    "text": "듣지 못해도 가족들의 사랑은 잘 알 수 있는 영화",
    "scene": "보리의 아빠가 너가 들리든 안들리든 우리는 똑같다고 하는 장면"
  },
  {
    "id": "r-058",
    "classNumber": 2,
    "rating": 4,
    "text": "서로 다르다고 해서 차별하지 말자",
    "scene": "정우와 보리와 골목길에서 둘이 걷는 장면"
  },
  {
    "id": "r-059",
    "classNumber": 2,
    "rating": 5,
    "text": "말하지 못해도 늘 서로 보살펴주는 가족이다",
    "scene": "경찰서에서 울면서 짜장면 먹는 장면"
  },
  {
    "id": "r-060",
    "classNumber": 2,
    "rating": 5,
    "text": "자신 빼고 안 들리지만 가족은 영원하다고 생각한다",
    "scene": "부적을 던져버렸을때"
  },
  {
    "id": "r-061",
    "classNumber": 2,
    "rating": 4,
    "text": "가족에 눈빛도 나의 소리가 되는 영화.",
    "scene": "보리가 소리지르며 우는 장면"
  },
  {
    "id": "r-062",
    "classNumber": 2,
    "rating": 4.5,
    "text": "청각장애인의 마음을 알수있다",
    "scene": "정우가 반애들이 수어를 할수있으면 좋겠다 라는 장면"
  },
  {
    "id": "r-063",
    "classNumber": 2,
    "rating": 4.5,
    "text": "말하지 않아도 행복할 수 있다.",
    "scene": "정우가 친구들과 함께 축구하는 장면"
  },
  {
    "id": "r-064",
    "classNumber": 2,
    "rating": 5,
    "text": "우정을 3글자로 표현하면 ‘이 영화’다",
    "scene": "보리가 은정이한테 고민상담씬"
  },
  {
    "id": "r-065",
    "classNumber": 2,
    "rating": 5,
    "text": "바다같이 아주 시원시원한 가족",
    "scene": "은정이랑 보리가 나무에 앉아서 얘기하는 장면"
  },
  {
    "id": "r-066",
    "classNumber": 2,
    "rating": 5,
    "text": "가족은 내 곁에서 항상 지켜주는 소중한 사람들이다.",
    "scene": "경찰서에서 울면서 짜장면 먹는 장면"
  },
  {
    "id": "r-067",
    "classNumber": 2,
    "rating": 3.5,
    "text": "거창하지 않아도 따뜻함이 느껴지는 영화",
    "scene": "보리가 나자르 본주를 가져가는 장면"
  },
  {
    "id": "r-068",
    "classNumber": 2,
    "rating": 3.5,
    "text": "듣지 못해도 눈빛만으로 알 수 있는 가족간의 사랑 이야기",
    "scene": "보리의 아빠가 너가 들리든 안들리든 우리는 똑같다고 하는 장면"
  },
  {
    "id": "r-069",
    "classNumber": 2,
    "rating": 4.5,
    "text": "가족의 완벽한소리 당신을 위하여 ‘보여 드립니다.’",
    "scene": "짜장면 먹는 장면"
  },
  {
    "id": "r-070",
    "classNumber": 2,
    "rating": 5,
    "text": "청춘 또는 낭만있는 영화",
    "scene": "보리와 아빠가 낚시하는 장면"
  },
  {
    "id": "r-071",
    "classNumber": 2,
    "rating": 5,
    "text": "다른곳에서 다치면 집에선 보살펴주는게 사랑이다.",
    "scene": "경찰서에서 울면서 짜장면 먹는 장면"
  },
  {
    "id": "r-072",
    "classNumber": 2,
    "rating": 3.5,
    "text": "듣지 못해도 눈빛만으로 알 수 있는 가족간의 사랑 이야기",
    "scene": "보리의 아빠가 너가 들리든 안들리든 우리는 똑같다고 하는 장면"
  },
  {
    "id": "r-073",
    "classNumber": 2,
    "rating": 4,
    "text": "말 못하는 이 세상이 아무리 불편해도 우리가족의 사랑은 변치 않다",
    "scene": "은정이와 보리가 나무 밑에서 얘기하는 장면"
  },
  {
    "id": "r-074",
    "classNumber": 2,
    "rating": 3.5,
    "text": "가족지키미인 보리의 고민을 다룬 영화",
    "scene": "보리네집에 은정이가 놀러와서 보리가 들리는 사실을 알리는 장면"
  },
  {
    "id": "r-075",
    "classNumber": 2,
    "rating": 3,
    "text": "좋은 미래가 예상되는 영화",
    "scene": "정우가 대회에서 준우승한 장면"
  },
  {
    "id": "r-076",
    "classNumber": 2,
    "rating": 4.5,
    "text": "울지마라 보리야",
    "scene": "보리가 경찰서에서 울면서도 짜장면을 보는 모습"
  },
  {
    "id": "r-077",
    "classNumber": 2,
    "rating": 5,
    "text": "보리야 사랑해❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️",
    "scene": "보리와 아빠가 낚시하는 장면"
  },
  {
    "id": "r-078",
    "classNumber": 2,
    "rating": 5,
    "text": "가족들이 나에게 사랑을 주면 그것은 곧 내 행복이다.",
    "scene": "경찰서에서 울면서 짜장면 먹는 장면"
  },
  {
    "id": "r-079",
    "classNumber": 2,
    "rating": 5,
    "text": "안들려도 손으로 의사소통을 해결하는 해결사 가족",
    "scene": "아빠와 보리가 낚시를 하며 얘기를 하는 장면"
  },
  {
    "id": "r-080",
    "classNumber": 2,
    "rating": 5,
    "text": "마음을 울리는 영화",
    "scene": "아빠랑보리가 낚시하는씬"
  },
  {
    "id": "r-081",
    "classNumber": 2,
    "rating": 4.5,
    "text": "짜장면 맛있겟다 나도  먹을래",
    "scene": "정우가 축구하는 것을 보며 짜장면을 먹는 모습"
  }
];

const posterGrid = document.querySelector("#posterGrid");
const reviewGrid = document.querySelector("#reviewGrid");
const activityFrame = document.querySelector("#activityFrame");
const filterButtons = document.querySelectorAll(".filter-button");
const modal = document.querySelector("#posterModal");
const modalPanel = modal.querySelector(".modal-panel");
const modalBody = document.querySelector("#modalBody");
let lastFocusedElement = null;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderStars(rating) {
  const maxStars = 5;
  const safeRating = Math.max(0, Math.min(maxStars, Number(rating) || 0));
  const fullStars = Math.floor(safeRating);
  const hasHalfStar = safeRating - fullStars >= 0.5;

  return `${"★".repeat(fullStars)}${hasHalfStar ? "☆" : ""}`;
}

function createPosterImageMarkup(poster, imageClass = "", loading = "lazy") {
  if (poster.imageSrc) {
    return `
      <img
        class="${escapeHtml(imageClass)}"
        src="${escapeHtml(poster.imageSrc)}"
        alt="${escapeHtml(poster.imageAlt)}"
        loading="${escapeHtml(loading)}"
      >
    `;
  }

  return `
    <div
      class="poster-placeholder ${escapeHtml(imageClass)}"
      role="img"
      aria-label="${escapeHtml(poster.imageAlt)} 이미지가 들어갈 자리"
    >
      <div class="placeholder-text">
        <span>Poster Placeholder</span>
        <strong>${escapeHtml(poster.title)}</strong>
      </div>
    </div>
  `;
}

function renderPosters() {
  if (!posterGrid) {
    return;
  }

  posterGrid.innerHTML = posters.map((poster) => `
    <article class="poster-card">
      <div class="poster-art">
        ${createPosterImageMarkup(poster)}
      </div>
      <div class="poster-content">
        <h3>${escapeHtml(poster.title)}</h3>
        <p class="poster-copy">${escapeHtml(poster.copy)}</p>
        <div class="poster-details">
          <div class="detail-row">
            <strong>이 포스터에 담긴 명장면</strong>
            <p>${escapeHtml(poster.mainScene)}</p>
          </div>
          <div class="detail-row">
            <strong>학생 한줄평 일부</strong>
            <p>${escapeHtml(poster.quotePreview)}</p>
          </div>
        </div>
        <button
          class="button"
          type="button"
          data-poster-id="${escapeHtml(poster.id)}"
          aria-label="${escapeHtml(poster.title)} 자세히 보기"
        >
          자세히 보기
        </button>
      </div>
    </article>
  `).join("");
}

function renderReviews(filter = "all") {
  if (!reviewGrid) {
    return;
  }

  const filteredReviews = filter === "all"
    ? reviews
    : reviews.filter((review) => String(review.classNumber) === filter);

  reviewGrid.innerHTML = filteredReviews.map((review) => `
    <article class="review-card">
      <span class="stars" aria-label="${escapeHtml(review.rating)}점 만점 5점">
        ${renderStars(review.rating)}
      </span>
      <blockquote>${escapeHtml(review.text)}</blockquote>
      <footer>1학년 ${escapeHtml(review.classNumber)}반 · ${escapeHtml(review.scene)}</footer>
    </article>
  `).join("");
}

function openPosterModal(posterId) {
  const poster = posters.find((item) => item.id === posterId);

  if (!poster) {
    return;
  }

  lastFocusedElement = document.activeElement;

  modalBody.innerHTML = `
    <div class="modal-layout">
      <div class="modal-poster">
        ${createPosterImageMarkup(poster, "modal-poster-image", "eager")}
      </div>
      <div class="modal-content">
        <p class="modal-kicker">1학년 ${escapeHtml(poster.classNumber)}반 포스터</p>
        <h2 id="modalTitle">${escapeHtml(poster.title)}</h2>
        <div class="modal-section">
          <h3>대표 명장면</h3>
          <p>${escapeHtml(poster.mainScene)}</p>
        </div>
        <div class="modal-section">
          <h3>대표 카피</h3>
          <p>${escapeHtml(poster.copy)}</p>
        </div>
        <div class="modal-section">
          <h3>포스터 기획 의도</h3>
          <p>${escapeHtml(poster.intention)}</p>
        </div>
        <div class="modal-section">
          <h3>관련 학생 한줄평</h3>
          <ul class="modal-reviews">
            ${poster.relatedReviews.map((review) => `<li>${escapeHtml(review)}</li>`).join("")}
          </ul>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modalPanel.focus();
}

function closePosterModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  modalBody.innerHTML = "";

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

function handleFilterClick(event) {
  const button = event.currentTarget;
  const filter = button.dataset.filter;

  filterButtons.forEach((item) => {
    const isActive = item === button;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });

  renderReviews(filter);
}

function handleDocumentClick(event) {
  const posterButton = event.target.closest("[data-poster-id]");
  const closeButton = event.target.closest("[data-modal-close]");

  if (posterButton) {
    openPosterModal(posterButton.dataset.posterId);
  }

  if (closeButton) {
    closePosterModal();
  }
}

function handleKeydown(event) {
  if (event.key === "Escape" && modal.classList.contains("is-open")) {
    closePosterModal();
  }
}

function init() {
  renderPosters();
  renderReviews();

  if (activityFrame) {
    activityFrame.src = activityUrl;
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", handleFilterClick);
  });

  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleKeydown);
}

init();
