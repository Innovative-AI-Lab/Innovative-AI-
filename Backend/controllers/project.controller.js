import projectModel from "../models/project.model.js";
import * as projectService from "../services/project.service.js";
import userModel from "../models/user.model.js";
import activityService from "../services/activity.service.js";
import {validationResult} from "express-validator";



export const createProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { name } = req.body;
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        const userId = loggedInUser._id;

        const newProject = await projectService.createProject({ name, userId });

        // Log activity
        await activityService.logActivity(userId, 'created_project', `Created project "${name}"`, { projectName: name }, newProject._id);

        res.status(201).json(newProject);

    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
}

export const getAllProject = async (req, res) => {
    try {

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const allUserProjects = await projectService.getAllProjectByUserId({
            userId: loggedInUser._id
        })

        return res.status(200).json({
            projects: allUserProjects
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }
}

// export const addUserToProject = async (req, res) => {
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//         const { projectId, users } = req.body;

//         const loggedInUser = await userModel.findOne({ email: req.user.email });

//         const project = await projectService.addUserToProject({
//             projectId,
//             users,
//             userId: loggedInUser._id
//         });

//         if (!projectId) {
//             return res.status(400).json({ error: 'projectId is required' });
//         }

//         // const project = await projectModel.findById(projectId);

//         if (!project) {
//             return res.status(404).json({ error: 'Project not found' });
//         }

//         // add users to the project.users array without duplicates
//         const updatedProject = await projectModel.findByIdAndUpdate(
//             projectId,
//             { $addToSet: { users: { $each: users } } },
//             { new: true }
//         );

//         return res.status(200).json(updatedProject);
//     } catch (err) {
//         console.log(err);
//         return res.status(400).json({ error: err.message });
//     }
// }



export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { projectId, users } = req.body

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })


        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: loggedInUser._id
        })

        return res.status(200).json({
            project,
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }


}


export const getProjectById = async (req, res) => {

    const { projectId } = req.params;

    try {

        const project = await projectService.getProjectById({ projectId });

        return res.status(200).json({
            project
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }

}                       
    