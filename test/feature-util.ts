import {prismaClient} from "../src/application/db"
import {FileStorage} from "../src/application/fileStorage"
import {UserTest} from "./test-util"

export class FeatureTest {
    static scope = "feature"

    static key(value: string): string {
        return value.replaceAll("__feature_", "__" + this.scope + "_")
            .replaceAll("feature-", this.scope + "-")
    }

    static async create(){
        await UserTest.create(this.key("__feature_admin__"), this.key("__feature_admin__@example.com"), this.key("feature-token"), "ADMIN")
        await UserTest.create(this.key("__feature_staff__"), this.key("__feature_staff__@example.com"), this.key("feature-staff-token"), "STAF")
        const user = await UserTest.get(this.key("__feature_staff__@example.com"))
        await prismaClient.category.create({
            data: {name: this.key("__feature_unused_category__"), description: "Unused test category"}
        })
        const category = await prismaClient.category.create({
            data: {name: this.key("__feature_category__"), description: "Test category"}
        })
        const activity = await prismaClient.activity.create({
            data: {
                name: this.key("__feature_activity__"),
                description: "Test activity",
                start_date: new Date("2026-09-15T00:00:00.000Z"),
                end_date: new Date("2026-09-17T00:00:00.000Z"),
                category_id: category.id,
                responsible_user_id: user.id,
                status: "DIRENCANAKAN"
            }
        })
        const filePath = await FileStorage.save(Buffer.from("%PDF-1.4\n%%EOF"), "pdf")
        await prismaClient.documentation.create({
            data: {
                activity_id: activity.id,
                file_name: "test.pdf",
                file_path: filePath,
                mime_type: "application/pdf",
                size: Buffer.byteLength("%PDF-1.4\n%%EOF"),
                uploaded_by: user.id
            }
        })
    }

    static async get(){
        const category = await prismaClient.category.findUniqueOrThrow({
            where: {name: this.key("__feature_category__")}
        })
        const unusedCategory = await prismaClient.category.findUniqueOrThrow({
            where: {name: this.key("__feature_unused_category__")}
        })
        const activity = await prismaClient.activity.findFirstOrThrow({
            where: {category_id: category.id},
            orderBy: {id: "asc"}
        })
        const document = await prismaClient.documentation.findFirstOrThrow({
            where: {activity_id: activity.id},
            orderBy: {id: "asc"}
        })
        const admin = await UserTest.get(this.key("__feature_admin__@example.com"))
        const staff = await UserTest.get(this.key("__feature_staff__@example.com"))
        return {category, unusedCategory, activity, document, admin, staff}
    }

    static async delete(){
        const categories = await prismaClient.category.findMany({
            where: {
                name: {in: [
                    this.key("__feature_category__"),
                    this.key("__feature_unused_category__"),
                    this.key("__feature_created_category__")
                ]}
            }
        })
        const documents = await prismaClient.documentation.findMany({
            where: {
                activity: {category_id: {in: categories.map(category => category.id)}}
            }
        })
        for (const document of documents) {
            await FileStorage.delete(document.file_path)
        }
        await prismaClient.activity.deleteMany({
            where: {category_id: {in: categories.map(category => category.id)}}
        })
        await prismaClient.category.deleteMany({
            where: {id: {in: categories.map(category => category.id)}}
        })
        await UserTest.delete(this.key("__feature_admin__@example.com"))
        await UserTest.delete(this.key("__feature_staff__@example.com"))
    }
}
