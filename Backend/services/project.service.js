import mongoose from "mongoose";
import projectModel from "../models/project.model.js";


export const createProject = async ({
    name, userId
}) => {
    if (!name) {
        throw new Error("Project name is required");
    }
    if (!userId) {
        throw new Error("User ID is required");
    }

    // validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("User ID is not a valid ObjectId");
    }

    const project = await projectModel.create({
        name,
        users: [userId]
    });

    return project;
}

export const getAllProjectByUserId = async ({ userId }) => {
    if (!userId) {
        throw new Error('UserId is required')
    }

    // validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('UserId is not a valid ObjectId')
    }

    const allUserProjects = await projectModel.find({
        users: userId
    })

    return allUserProjects
}

// export const addUserToProject = async ({ projectId, users, userId }) => {
//     if (!projectId) {
//         throw new Error('ProjectId is required')
//     }
//     if (!userId) {
//         throw new Error('UserId is required')
//     }
//     // validate projectId and userId are valid ObjectIds
//     if (!mongoose.Types.ObjectId.isValid(projectId)) {
//         throw new Error('ProjectId is not a valid ObjectId')
//     }

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//         throw new Error('UserId is not a valid ObjectId')
//     }

//     if (!Array.isArray(users)) {
//             throw new Error("Invalid userId(s) in users array")
//         }
    
        

//     // const project = await projectModel.findById(projectId);
//     if (!project) {
//         throw new Error('Project not found')
//     }


//     const project = await projectModel.findOne({ _id: projectId, users:userId})


//     const updatedProject = await projectModel.findOneAndUpdate({
//             _id: projectId
//         }, {
//             $addToSet: {
//                 users: {
//                     $each: users
//                 }
//             }
//         }, {
//             new: true
//         })
    
//         return updatedProject



//     // ensure users array elements are ObjectIds (schema enforces this, but check input presence)
//     const userIdStr = userId.toString();
//     const already = project.users.some(u => u.toString() === userIdStr);
//     if (already) {
//         return project; // nothing to do
//     }

//     project.users.push(userId);
//     await project.save();

//     return project;
// }



export const addUsersToProject = async ({ projectId, users, userId }) => {

    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!users) {
        throw new Error("users are required")
    }

    if (!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))) {
        throw new Error("Invalid userId(s) in users array")
    }

    if (!userId) {
        throw new Error("userId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId")
    }


    const project = await projectModel.findOne({
        _id: projectId,
        users: userId
    })

    console.log(project)

    if (!project) {
        throw new Error("User not belong to this project")
    }

    const updatedProject = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        $addToSet: {
            users: {
                $each: users
            }
        }
    }, {
        new: true
    })

    return updatedProject



}


export const getProjectById = async ({ projectId }) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    const project = await projectModel.findOne({
        _id: projectId
    }).populate('users')

    return project;
}
