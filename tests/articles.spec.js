const request = require("supertest");
const { app } = require("../server");
const jwt = require("jsonwebtoken");
const config = require("../config");
const mockingoose = require("mockingoose");
const User = require("../api/users/users.model");
const Article = require("../api/articles/articles.schema");
const articlesService = require("../api/articles/articles.service");

describe("tester API articles", () => {
  const USER_ID = "507f1f77bcf86cd799439011";
  const ARTICLE_ID = "507f191e810c19729de860ea";
  let token;

  const MOCK_ARTICLE = {
    _id: ARTICLE_ID,
    title: "titre",
    content: "contenu",
    status: "draft",
    user: USER_ID,
  };

  // Le middleware d'auth charge l'utilisateur en base (findById -> findOne).
  // On choisit son rôle test par test pour couvrir admin et non-admin.
  const authAs = (role) =>
    mockingoose(User).toReturn(
      { _id: USER_ID, name: "Testeur", email: "test@test.net", role },
      "findOne"
    );

  beforeEach(() => {
    mockingoose.resetAll();
    token = jwt.sign({ userId: USER_ID }, config.secretJwtToken);
    mockingoose(Article).toReturn(MOCK_ARTICLE, "save");
    mockingoose(Article).toReturn(MOCK_ARTICLE, "findOneAndUpdate");
    mockingoose(Article).toReturn({ deletedCount: 1 }, "deleteOne");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("[Articles] Création → 201 et enregistre l'utilisateur connecté", async () => {
    authAs("member");
    const res = await request(app)
      .post("/api/articles")
      .set("x-access-token", token)
      .send({ title: "Mon article", content: "Contenu" });
    expect(res.status).toBe(201);
    expect(res.body.user).toBe(USER_ID);
  });

  test("[Articles] Création appelle articlesService.create", async () => {
    authAs("member");
    const spy = jest.spyOn(articlesService, "create");
    await request(app)
      .post("/api/articles")
      .set("x-access-token", token)
      .send({ title: "Mon article", content: "Contenu" });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test("[Articles] Mise à jour par un admin → 200", async () => {
    authAs("admin");
    const res = await request(app)
      .put(`/api/articles/${ARTICLE_ID}`)
      .set("x-access-token", token)
      .send({ title: "Titre modifié" });
    expect(res.status).toBe(200);
  });

  test("[Articles] Mise à jour refusée pour un non-admin → 401", async () => {
    authAs("member");
    const res = await request(app)
      .put(`/api/articles/${ARTICLE_ID}`)
      .set("x-access-token", token)
      .send({ title: "Titre modifié" });
    expect(res.status).toBe(401);
  });

  test("[Articles] Suppression par un admin → 204", async () => {
    authAs("admin");
    const res = await request(app)
      .delete(`/api/articles/${ARTICLE_ID}`)
      .set("x-access-token", token);
    expect(res.status).toBe(204);
  });

  test("[Articles] Suppression refusée pour un non-admin → 401", async () => {
    authAs("member");
    const res = await request(app)
      .delete(`/api/articles/${ARTICLE_ID}`)
      .set("x-access-token", token);
    expect(res.status).toBe(401);
  });
});
